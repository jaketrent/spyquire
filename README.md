# spyquire

require() replacement for a test environment that allows easy spying

![I'm a spy](http://i.imgur.com/yuKcrP9.jpg)

## Usage

```
var spyquire = require('spyquire')

var spies = spyquire('../my-app/module-under-test')
  .with('../my-app/other-mocked-dependency').nick('shortName')

var moduleUnderTest = spies.exec()

describe('moduleUnderTest#myFn', function () {

  it('has a dependency interaction', function() {

    spies.at('shortName').returns = 'mocked return val'
    spies.at('shortName').errors = 'mocked error return'

    moduleUnderTest.myFn()

    spies.at('shortName').called.should.be.true
    spies.at('shortName').calledCount.should.eql(1)
    spies.at('shortName').args[0].should.eql('some known arg')
    spies.at('shortName').returns.should.eql('mocked return val')

  })

});

```

For complete usage, see the `test` directory.