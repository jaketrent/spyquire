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
  this.args = null
  this.errors = null
  this.returns = null
}

Spy.prototype.isObjectMethod = function () {
  return this.methodName != null
}

Spy.prototype.fn = function () {
  this.called = true
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

Spies.prototype.with = function (depRelPath, methodName) {
  var spy = new Spy(methodName)
  this.spies[depRelPath] = spy
  this.spyLastAdded = spy
  return this
}

Spies.prototype.nick = function (name) {
  this.spyLastAdded.nick = name
  return this
}

Spies.prototype.at = Spies.prototype.called = function (depRelPathOrNick) {
  return this.spies[depRelPathOrNick] || this.getSpyWithNick(depRelPathOrNick)
}

Spies.prototype.getSpyWithNick = function (nick) {
  for (var key in this.spies) {
    var spy = this.spies[key]
    if (spy.nick === nick)
      return spy
  }
}

Spies.prototype.reset = function () {
  var self = this
  Object.keys(this.spies).forEach(function (key) {
    self.spies[key].reset()
  })
}

Spies.prototype.exec = Spies.prototype.require = function () {
  var self = this
  var proxyquireStubs = Object.keys(this.spies).reduce(function (stubs, key) {
    if (self.spies[key].isObjectMethod()) {
      var obj = {}
      obj[self.spies[key].methodName] = self.spies[key].fn.bind(self.spies[key])
      stubs[key] = obj
    } else {
      stubs[key] = self.spies[key].fn.bind(self.spies[key])
    }
    return stubs
  }, {})

  return proxyquire(this.modulePath, proxyquireStubs)
}

var spyquire = function (modulePath) {
  return new Spies(modulePath)
}

module.exports = spyquire