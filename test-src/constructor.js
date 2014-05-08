
var Constructor = function () {}

Constructor.prototype.protoMethod = function () {
  throw new Error('Spy on this prototype method instead')
}

module.exports = Constructor