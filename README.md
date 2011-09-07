![Alt text](https://github.com/hij1nx/EventVat/raw/master/logo.png)

# Synopsis

### EventVat is an in-process key/value store with an API that emulates the Redis API. It's also event based, which means that when changes to the data are made, events will be raised for which a callback can be provided. It supports 5 data types, Strings, Numbers, Booleans, Arrays and Hashes.

# Motivation

 - For processes who do not share data, it reduces unnecessary trips across the process boundary.
 - Portability, works in the browser and on the server.
 - Actions against the data are event based.
 - Write to any storage end-point (such as local browser storage, a filesystem or couchdb).

# Usage

Instantiate EventVat with existing data or without. Methods and events are hung off of the new instance. Each method that can act on the instance will raise an event by the same name. 

## events
EventVat uses an implementation of <a href="https://github.com/hij1nx/EventEmitter2">EventEmitter</a>. Listeners can attached to an EventVat object. An EventVat object can emit and event and a listener will respond. An event has three characteristics, the event name, a listener and an associated data key or wildcard.

### Key based events

```javascript
  var demo = EventVat();

  demo.on('get foo', function(key, value) {
    console.log('getting: ', key, value);
  });

  demo.get('foo');
```

### Wildcard events

```javascript
  var demo = EventVat();

  demo.on('get foo', function(key, value) {
    console.log('getting: ', key, value);
  });

  demo.get('foo');
```

(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
