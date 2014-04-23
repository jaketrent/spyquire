# spyquire

## What is it?

spyquire is a `require` replacement for test environments that allows easy spying.

![I'm a spy](http://i.imgur.com/yuKcrP9.jpg)

## Why use it?

A [test spy](http://xunitpatterns.com/Test%20Spy.html) is meant to observe calls that are made in the subject under test.  If you're testing a module in your source, it may be that it depends on other modules.  In a unit test, your unit boundaries are often found on your module.  At least, if they are, this library will help you more.  You want to test one unit at a time and not other units (ie, other modules).

You still care that the other modules that are depended upon support your subject under test well, so you'll want to verify that they're used.  If different usage yields different results, you'll also want to verify that the usage is what you expect.

You specify modules that your code depends on via `require` statements.  You will use this library as a `require` replacement where you don't want to specifically run other module code but just want to spy on it.

## What you'll be spying on

spyquire will give you the following information on module dependencies:

- `called` - {boolean} Was the dependency function called or not?
- `calledCount` - {number} How many times was the dependency function called?
- `args` - {arguments} The arguments the dependency function was called with

You can also setup your dependencies' functions to act in specific ways:

- `returns` - sets the return value of a sync or async function
- `errors` - sets the error value of an async function

## Usage


### Setup

First, use spyquire to require your subject under test:

```
var spyquire = require('spyquire')
var spies = spyquire('../app/module-under-test')
```

Next, specify what dependencies you want to spy on.  For single export module functions, usage looks like this:

```
spies.with('../app/my-dependency').nick('dep')
```

For modules with multiple exports, you can specify each spied-on function like this:

```
spies.with('../app/other-dep', 'asyncFnName').nick('other#async')
     .with('../app/other-dep', 'fn2Name').nick('other#fn2')
```

To get the required subject under test, call `exec`:

```
var myModule = spies.exec()
```

Note: When specifying spies, you can designate a nickname for easy access later.
Note: The spyquire setup API allows chaining, so you can do the setup in a continuous statement if you'd like.


### Expectations

If you want to specify how the spy function should act, you can specify a return value.  For synchronous functions, that looks like this:

```
spies.at('dep').returns = 'my expected return val'
```

For async functions, the library will assume Node conventions:

- A spy function that is passed a function callback as the last parameter will be seen as async
- The callback's first parameter will be an error value

For asynchronous functions, expectations might look like this:

```
spies.at('other#async').errors = 'simulated error explosion'
spies.at('other#async').returns = 'my expected return val'
```

Note: If no nickname is supplied, use the module path and function name, if applicable, to reference a spy.


### Verification

Now, call your functions and verify the things you care about (ie, `called`, `calledCount`, `args`, and actual return and error values).

For sync functions, that might look like:

```
actual = myModule.doSync()
actual.should.eql('my expected return val')
spies.at('dep').called.should.be.true
```

For async functions, that might look like:

```
thing = 'abc123'
myModule.doAsync(thing, function (err, data) {
  err.should.eql('simulated error explosion')
  spies.at('other#async').calledCount.should.eql(1)
  spies.at('other#async').args[0].should.eql(thing)
})
```

For additional usage examples, see the `test` directory.