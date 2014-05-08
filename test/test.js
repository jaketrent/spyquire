var should = require('should')
var spyquire = require('../index')

var spies = spyquire('../test-src/app')
  .with('./fn').nick('fn')
  .with('./obj', 'objMethod')
  .with('./obj', 'anotherMethod').nick('another')
  .with('./async', 'doAsync').nick('async')
  .with('./constructor').nick('Constructor')
  .with('./constructor', 'protoMethod').nick('C#protoMethod')

var app = spies.exec()

describe('app with spyquire', function () {

  beforeEach(function () {
    spies.reset()
  })

  it('calls fn', function () {
    spies.at('fn').returns = 'my mock things'
    actual = app.doStuff()
    spies.at('./fn').called.should.be.true
    should.not.exist(spies.at('./fn').args)
    actual.should.eql('my mock things')
  })

  it('calls object#fn', function () {
    spies.at('./obj', 'objMethod').returns = 'some mock'
    actual = app.doObjStuff()
    actual.should.eql('some mock')
  })

  it('calls another object#fn', function () {
    spies.at('another').returns = 'some mock'
    actual = app.doOtherObjStuff()
    actual.should.eql('some mock')
  })

  it('tests fn again with fresh state', function () {
    spies.at('./fn').called.should.be.false
    spies.at('./fn').returns = 'my mock things diff'
    actual = app.doStuff()
    spies.at('fn').called.should.be.true
    should.not.exist(spies.at('./fn').args)
    actual.should.eql('my mock things diff')
  })

  it('handles async callbacks', function (done) {
    spies.at('async').returns = 'mock async return val'
    app.doAsyncStuff(function (err, data) {
      data.should.eql('mock async return val')
      done()
    })
  })

  it('handles async callbacks with errors as first param', function (done) {
    spies.at('async').errors = 'mock async errors'
    app.doAsyncStuff(function (err, data) {
      err.should.eql('mock async errors')
      done()
    })
  })

  it('spies on constructors and prototype methods', function () {
    spies.at('C#protoMethod').returns = 'proto mock!'
    actual = app.doConstructorStuff()
    actual.should.eql('proto mock!')
  })

})
