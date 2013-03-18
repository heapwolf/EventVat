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
Each new instance of `EventVat` is a hash. There are lots of convenient methods attached to each new instance.

## events
EventVat uses <a href="https://github.com/hij1nx/EventEmitter2">EventEmitter2</a>. Listeners can attached to an EventVat object. An EventVat object can emit and event and a listener will respond. An event has three characteristics, the event name, a listener and an associated data key or wildcard.

```javascript
  var vat = EventVat();

  vat.on('get foo', function(key, value) {

    console.log('`' + key + '` has the value: `' + value + '`');
  });

  vat.set('foo', 'hello, world');
  vat.get('foo');
```

# API

## instance methods

### publish()
Synonymous with `EventEmitter2.prototype.emit`

### subscribe()
Synonymous with `EventEmitter2.prototype.on`

### unsubscribe()
Synonymous with `EventEmitter2.prototype.removeListener`

### die(key)
Expire a key

### del(key /* ... */)
Delete a key

### exists(key)
Determine if a key exists

### expire(key, ttl)
Set a key's time to live in seconds

### expireat(key, dueDate)
Set the expiration for a key as a UNIX timestamp

### keys(regex)
Find all keys matching the given pattern

### move(key, db)
Move a key to another database

### object(subcommend /* ... */)
Inspect the internals of an object

### persist(key)
Remove the expiration from a key

### randomkey()
Return a random key from the keyspace

### rename(oldKey, newKey)
Rename a key

### renamenx(oldKey, newKey)
Rename a key, only if the new key does not exist

### sort()
Sort the elements in a list, set or sorted set

### type(key)
Determine the type stored at key

### ttl(key)
Get the time to live for a key

### append(key, value)
Append a value to a key

### decr(key)
Decrement the integer value of a key by one

### decrby(key, value)
Decrement the integer value of a key by the given number

### get(key)
Get the value of a key

### getbit(key)
Returns the bit value at offset in the string value stored at key

### getrange(key, start, end)
Get a substring of the string stored at a key

### getset(key, value)
Set the string value of a key and return its old value

### incr(key)
Increment the integer value of a key by one

### incrby(key, value)
Increment the integer value of a key by the given number

### mget(key /* ... */)
Get the values of all the given keys

### mset(keys /* ... */, values /* ... */)
Set multiple keys to multiple values

### msetnx(keys /* ... */, values /* ... */)
Set multiple keys to multiple values, only if none of the keys exist

### set(key, value, ttl)
Set the string value of a key

### setbit(key, offset, value)
Sets or clears the bit at offset in the string value stored at key

### setex(key, seconds, value)
Set the value and expiration of a key

### setnx(key, value, ttl)
Set the value of a key, only if the key does not exist

### setrange(key, offset, value)
Overwrite part of a string at key starting at the specified offset

### strlen(key)
Get the length of the value stored in a key

### hdel(key, field /* ... */)
Delete one or more hash fields

### hexists(key, field)
Determine if a hash field exists

### hget(key, field)
Get the value of a hash field

### hgetall(key)
Get all the fields and values in a hash

### hincr(key, field)
Increment the integer value of a hash field by one

### hincrby(key, field, value)
Increment the integer value of a hash field by the given number

### hdecr(key, field)
Decrement the integer value of a hash field by one

### hdecrby(key, field, value)
Decrement the integer value of a hash field by the given number  

### hkeys(key)
Get all the fields in a hash

### hlen(key)
Get the number of fields in a hash

### hmget(key, field /* ... */)
Get the values of all the given hash fields

### hmset(key, fields /* ... */, values /* ... */)
Set multiple hash fields to multiple values

### hset(key, field, value)
Set the string value of a hash field

### hsetnx(key, field, value /* ... */)
Set the value of a hash field, only if the field does not exist

### hvals(key)
Get all the values in a hash

### dump(stringify)
Dump the current data store into a string

### swap(a, b, depth)
Swap two values

### findin(key, value)
Search within the value of a key

# Tests

```bash
$npm test
```

(The MIT License)

Copyright (c) 2010 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE DBSIZEORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
