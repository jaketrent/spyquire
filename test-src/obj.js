exports.objMethod = function () {
  throw new Error('Do not call this function.  Spy on it!')
  return "obj real thing"
}

exports.anotherMethod = function () {
  throw new Error('Do not call this function.  Spy on it!')
  return "obj real thing from another method"
}

