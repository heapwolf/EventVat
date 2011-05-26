![Alt text](https://github.com/hij1nx/evtvat/raw/master/logo.png)

Memvat - *Memory* (To retain information), *Vat* (A large tank or tub used to hold liquid)

# Synopsis

Memvat is a in-process key/value store. It's a simple data model with an API inspired by Redis. It supports 5 data types, `strings`, `numbers`, `booleans`, `arrays` and `hashes`. It's evented, which means that when changes are made to the data, an event will get raised for which a callback can be provided. Memvat is great for working with volatile (short time to live) data in Node.js and the browser.

# Motivation

 - Reduce trips across the process boundary.
 - Portability, works in the browser and on the server.
 - Event based data manipulation.
 - A single API for many data storage end-points.

# Usage

Instantiate Memvat with existing data or without. Methods and events are hung off of the new instance. Each method that can act on the instance will raise an event by the same name. 

## events
Memvat uses a slightly tweaked version of the Node.js event Emitter. A Memvat event has three characteristics, a name, an optional key and a callback.

### Activity based events.

```javascript
var m = new Memvat;

m.on('get', function(key, value) {
  console.log('getting: ',key, value);
});

m.set('foo', 'bar');

m.get('foo');
```

### Activity/Key based events.

```javascript
var m = new Memvat;

m.on('get', 'foo', function(key, value) {
  console.log('getting: ',key, value);
});

m.on('set', 'foo', function(key, value) {
  console.log('setting: ', key, value);
});    

m.set('foo', 'bar');

m.get('foo');
```



# API



// Memvat is a pluggable, evented, key/value store for single process, short-term run-time environments.

var m = Memvat({ "key": "value" }); // create a new Memvat object with a existing key/value pairs, returns new instance.

var m = Memvat('id'); // create a new Memvat object with a existing key/value pairs, returns new instance.


m.get('key'); // get the value of the 'key' key, returns value.

m.set('key', 'value'); // set the value of 'key' to 'value', returns bool.
m.set('key', true); // create 'key' and assign it nothing, overwrites existing, new timestamp, returns success bool.
m.setnx('key', 'value'); // create 'key' and assign it nothing, returns false upon finding existing key.

m.set(m.random(), 'value'); // creates a random key and assigns it 'value', returns the new key.

m.ren('key', 'key'); // rename a key, preserve the date/timestamp, returns success bool.

m.decr('key'); // if the value is numeric, decrement it.
m.incr('key'); // if the value is numeric, increment it.

m.swap('key', 'key'); // swap the value of one key with another.
m.findin('key', 'value'); // same as indexOf in a string.
m.replace('key', '')

m.del('key'); // delete the 'key' key, returns success bool.

m.created('key'); // returns the date/time the 'key' key was created.

m.exists('key', function(key, value) { // an event handler registered to the 'key' key if it exists.
  console.log(key, value);
});

m.exists('key', 1000, function(key, value) { // an event handler registered to the 'key' key if it exists after Time.
  console.log(key, value);
});

m.on('del', 'key', function(key, value) { // an event handler registered to the 'del' event for the 'key' key.
  console.log(key, value);
});

m.expire('key', 1000); // a key can expire after Time, returns 
m.expire('key', 'event'); // a key can expire on Event

m.ttl('key'); // reutns the time to live.
m.ttl('key', '+1000'); // add time.
m.ttl('key', '-1000'); // subtract time.


m.dump(true); // get everything and dump it, accepts bool for JSON.stringify

m.save(m.dump(true)); // attempt dump to local storage

