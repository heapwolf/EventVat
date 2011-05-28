![Alt text](https://github.com/hij1nx/EventVat/raw/master/logo.png)

# Synopsis

### EventVat is an in-process key/value store with an API inspired by Redis. But it's also event based, which means that when changes to the data are made, events will be raised for which a callback can be provided. It supports 5 data types, Strings, Numbers, Booleans, Arrays and Hashes.

# Motivation

 - Reduce trips across the process boundary.
 - Portability, works in the browser and on the server.
 - Event based key/value storage and retrieval.
 - A single API for many data storage end-points (such as local browser storage, a local filesystem or couchdb).

# Usage

Instantiate EventVat with existing data or without. Methods and events are hung off of the new instance. Each method that can act on the instance will raise an event by the same name. 

## events
EventVat uses a slightly tweaked version of the Node.js event Emitter. A EventVat event has three characteristics, a name, an optional key and a callback.

### Regular events.

```javascript
  var demo = EventVat();

  demo.on('get', function(key, value) {
    console.log('getting: ', key, value);
  });

  demo.get('foo');
```

### Key based events.

```javascript
  var demo = EventVat();

  demo.on('get', 'foo', function(key, value) {
    console.log('getting: ', key, value);
  });

  demo.get('foo');
```

# API

### Constructor
#### EventVat(data)

```javascript
  var demo = EventVat(data); // create a new EventVat object with a existing key/value pairs, returns new instance.
```

### Instance methods

<h3><a href="#">KEYS</a></h3>

#### del(key)
Delete the `key`. Returns boolean value to represent the success of the operation.

```javascript
  demo.del('key');
```

#### exists(key)
Checks to see if the key exists. Returns boolean value to represent the success of the operation.

```javascript
  demo.exists('foo');
```

#### expires(key)
Set a key's time to live in seconds

```javascript
  demo.expires('foo');
```

#### expireat()
Set the expiration for a key as a Javascript Date Object timestamp

```javascript
  demo.expires('foo', Date.now()); // obviously only for demonstration, expires now
```

#### keys()
Find all keys matching the given pattern using a regular expression.

```javascript
  demo.keys(/foo/);
```

#### move(key, db) 
Move a key to another database. **NOT IMPLEMENTED**

```javascript
  demo.move(key, db); // not sure how this is relevant.
```

#### object() 
Inspect the internals of an object. `console.log` instead? **NOT IMPLEMENTED**

```javascript
  demo.move(key, db);
```

#### persist(key)
Remove the expiration from a key.

```javascript
  demo.persist('foo');
```

#### randomkey()
Return a random key from the data.

```javascript
  demo.randomkey();
```

#### sort(key) **NOT IMPLEMENTED**
Return a random key from the data. 

```javascript
  demo.sort('foo'); // needs to get implemented.
```

#### type()
Return the javascript type of the value contained in the key.

```javascript
  demo.type('foo');
```

<h3><a href="#">STRINGS</a></h3>

#### append(key)
If key already exists and is a string, this command appends the value at the end of the string. If key does not exist it is created and set as an empty string, so `append` will be similar to `set` in this special case.

```javascript
  demo.append('foo', 'bar'); // if foo's value was `re` then the new value would be `rebar`.
```

#### decr(key [, value])
If the value of `key` is numeric, decrement it and return the new value. Implementation for `decrby`.

```javascript
  demo.decr('foo');
```

#### get(key)
Get the value of the `key`, returns the value retrieved.

```javascript
  demo.get('foo'); 
```

#### getbit(key, ...offset)
Returns the bit value at offset in the string value stored at key.
When offset is beyond the string length, the string is assumed to be a contiguous space with 0 bits. When key does not exist it is assumed to be an empty string, so offset is always out of range and the value is also assumed to be a contiguous space with 0 bits.

```javascript
  demo.set('foo', 7);
```

#### set(key [, value, ttl])
Set the value of `key` to `value`, returns boolean value to represent the success of the operation. If no value is assigned, the key's value will be emptied. if a time to live is specified, the key will be deleted after N milliseconds.

```javascript
  demo.set('foo', 'bar');
```

#### setnx(key, value)
Set a value on a key, but only do so if one does not exist. If the `key` already exists, return false.

```javascript
  demo.setnx('foo', 'bar'); // create 'key' and assign it nothing.
```

#### ttl(key [, value])
Find the TTL (time to live) value, or assign one to a key.

```javascript
  demo.ttl('foo'); // reutns the time to live.
```

#### rename(a, b, reset)
Rename a key from `a` to `b`. Will preserve the date/timestamp unless the boolean value `reset` is provided. Returns boolean value to represent the success of the operation.

```javascript
  demo.rename('foo', 'bar');
```


#### incr(key [, value])
If the value of `key` is numeric, increment it and return the new value. Implementation for `incrby`.

```javascript
  demo.incr('foo'); // if the value is numeric, increment it.
```

#### swap(a, b, depth)
Swap the value of `a` with `b`, if the boolean value `depth` is provided, the `created`, `modified`, `value` and `ttl` values will be 

```javascript
  demo.swap('foo', 'bar');
```

#### findin(key, value)
Return an index reflecting the position at which a match was found the `key`'s `value`.

```javascript
  demo.findin('foo', 'bla'); // same as indexOf in a string.
```

#### replace(key, valueA, valueB, global)
Within the value of `key`, replace `valueA` with `valueB` once, unless specified by the boolean value `global`.

```javascript
  demo.replace('foo', 'foo', 'bar', true)
```

#### dump(stringify)
Get the current data store and dump it. `stringify` determines if the method should call JSON.stringify on the data-store prior to returning it.

```javascript
  demo.dump(true);
```

<h3><a href="#">HASHES</a></h3>

To-Do: Implement.

<h3><a href="#">LISTS</a></h3>

To-Do: Implement.

<h3><a href="#">SETS</a></h3>

To-Do: Implement.

<h3><a href="#">SORTED SETS</a></h3>

To-Do: Implement.

<h3><a href="#">TRANSACTIONS</a></h3>

#### discard() **NOT IMPLEMENTED YET**
Discard all commands issued after MULTI

#### exec() **NOT IMPLEMENTED YET**
Execute all commands issued after MULTI

#### multi() **NOT IMPLEMENTED YET**
Mark the start of a transaction block

#### unwatch() **NOT IMPLEMENTED YET**
Forget about all watched keys

#### watch(key [, ...key]) **NOT IMPLEMENTED YET**
Watch the given keys to determine execution of the MULTI/EXEC block

```javascript
  // This implementation needs to take into account the 'killer'. At the time of invocation, 
  // keys that fall into the transaction scope should have their state preserved for use with `discard()`.
```

### Static Methods

#### random() **NOT IMPLEMENTED YET**
Generates a random key and assigns it 'value', returns the new key.

```javascript
  demo.set(m.random(), 'value');
```

#### save() **NOT IMPLEMENTED YET**
Attempts to save a string to a either the local browser storage or a file stream.

```javascript
  demo.save(m.dump(true)); // attempt dump to local storage
```

# Licence

(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>, Joyent, Inc. and other Node contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
