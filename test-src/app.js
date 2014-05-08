/*
 * A FAKE APPLICATION FOR TEST TO TRY IMPORTS ON
 */

var fn = require('./fn')
var obj = require('./obj')
var async = require('./async')
var Constructor = require('./constructor')

exports.doStuff = function () {
  return fn()
}

exports.doObjStuff = function () {
  return obj.objMethod()
}

exports.doOtherObjStuff = function () {
  return obj.anotherMethod()
}

exports.doAsyncStuff = function (done) {
  async.doAsync(done)
}

exports.doConstructorStuff = function () {
  var con = new Constructor()
  return con.protoMethod()
}