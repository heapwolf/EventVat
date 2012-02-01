![Alt text](https://github.com/hij1nx/EventVat/raw/master/logo.png)

# Synopsis

### EventVat is an evented in-process key/value store with an API like that of Redis. It's event based, which means that when a method is called that affects the data, corresponding events will be raised. It supports 5 data types, Strings, Numbers, Booleans, Arrays and Hashes.

# Motivation

 - A datastore for small, volitile working sets
 - For processes who do not share data, it reduces unnecessary trips across the process boundary.
 - Portability, works in the browser and on the server.
 - Write to any storage end-point (such as local browser storage, a filesystem or couchdb).

# Installation

```bash
$npm install eventvat
```

# Usage

Instantiate EventVat with existing data or without. Methods and events are hung off of the new instance. Each method that can act on the instance will raise an event by the same name. 

## events
EventVat uses <a href="https://github.com/hij1nx/EventEmitter2">EventEmitter</a>. Listeners can attached to an EventVat object. An EventVat object can emit and event and a listener will respond. An event has three characteristics, the event name, a listener and an associated data key or wildcard.

### Key based events

```javascript
  var vat = EventVat();

  vat.on('get foo', function(key, value) {
    console.log('getting: ', key, value);
  });

  demo.get('foo');
```

### Wildcard events

```javascript
  var vat = EventVat();

  vat.on('get foo', function(key, value) {
    console.log('getting: ', key, value);
  });

  vat.get('foo');
```

# Tests

```bash
$npm test
```

(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
