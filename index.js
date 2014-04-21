//module.exports = require('./lib/spyquire')

// delete this module from the cache to force re-require in
// order to allow resolving test module via parent.module
delete require.cache[require.resolve(__filename)]

var proxyquire = module.parent.require('proxyquire')

var argsExist = function (args) {
  return args && Object.keys(args).length > 0
}

var isFunction = function (obj) {
  return typeof obj === 'function'
}

var hasCallbackArg = function (args) {
  return isFunction(getLastArg(args))
}

var getLastArg = function (args) {
  if (args && args.length)
    return args[args.length - 1]
}

var Spy = function (methodName) {
  this.methodName = methodName
  this.reset()
}

Spy.prototype.reset = function () {
  this.called = false
  this.callCount = 0
  this.args = null
  this.errors = null
  this.returns = null
}

Spy.prototype.isObjectMethod = function () {
  return this.methodName != null
}

Spy.prototype.fn = function () {
  this.called = true
  this.callCount += 1
  this.args = argsExist(arguments) ? arguments : null

  if (hasCallbackArg(this.args)) {
    getLastArg(this.args)(this.errors, this.returns)
  } else {
    return this.errors || this.returns
  }
}

var Spies = function (modulePath) {
  this.modulePath = modulePath
  this.spies = {}
}

/**
 * Stores spies internall in a structure like this:
 *
 * this.spies = {
 *   './relative/path': [spy, spy]
 * }
 *
 * Where each spy is self-contained, knowing its own spyable values and nickname
 *
 * @param depRelPath
 * @param methodName
 * @returns {Spies}
 */
Spies.prototype.with = function (depRelPath, methodName) {
  var spy = new Spy(methodName)
  if (!(this.spies[depRelPath] && this.spies[depRelPath].length))
    this.spies[depRelPath] = []
  this.spies[depRelPath].push(spy)
  this.spyLastAdded = spy
  return this
}

Spies.prototype.nick = function (name) {
  this.spyLastAdded.nick = name
  return this
}

Spies.prototype.at = function (depRelPathOrNick, methodName) {
  var spyList = this.spies[depRelPathOrNick]
  if (spyList) {
    if (!methodName) {
      return spyList[0]
    } else {
      for (var i in spyList) {
        var spy = spyList[i]
        if (spy.methodName === methodName)
          return spy
      }
    }
  } else {
    return this.getSpyWithNick(depRelPathOrNick)
  }

//  return this.spies[depRelPathOrNick] || this.getSpyWithNick(depRelPathOrNick)
}

Spies.prototype.getSpyWithNick = function (nick) {
  for (var path in this.spies) {
    var spyList = this.spies[path]

    for (var i in spyList) {
      var spy =  spyList[i]
      if (spy.nick === nick)
        return spy
    }
  }
}

Spies.prototype.reset = function () {
  var self = this
  Object.keys(this.spies).forEach(function (key) {
    self.spies[key].forEach(function (spy) {
      spy.reset()
    })
  })
}

Spies.prototype.exec = Spies.prototype.require = function () {
  var self = this

  var proxyquireStubs = Object.keys(this.spies).reduce(function (stubs, key) {
    var spyList = self.spies[key]
    var firstSpy = spyList[0]
    if (firstSpy.isObjectMethod()) {
      var obj = {}
      for (var i in spyList) {
        var spy = spyList[i]
        obj[spy.methodName] = spy.fn.bind(spy)
      }
      stubs[key] = obj
    } else {
      stubs[key] = firstSpy.fn.bind(firstSpy)
    }

    return stubs

  }, {})

  return proxyquire(this.modulePath, proxyquireStubs)
}

var spyquire = function (modulePath) {
  return new Spies(modulePath)
}

module.exports = spyquire