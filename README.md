
// Memkey is a pluggable, evented, key/value store for single process, short-term run-time environments.

var m = memvat({ "key": "value" }); // create a new Memkey object with a existing key/value pairs, returns new instance.

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
