var EventVat = require('../lib/eventvat');

var origTimeout = setTimeout;
this.methodSuite = {
    setUp: function(test) {

      setTimeout = function(fn, ms) {
        return origTimeout(fn, 0);
      };

      if (typeof test === 'function') {
        test();
      }
      else {
        test.done();
      }

    },

    tearDown: function(test) {

      setTimeout = origTimeout;

      if (typeof test === 'function') {
        test();
      }
      else {
        test.done();
      }

    },

    'Invoke `get` method and return value': function (test) {

      var vat = EventVat();

      test.equal(vat.get('a'), null);
      
      vat.die();
      test.done();

    },
    'Invoke `set` method and check value at key': function (test) {

      var vat = EventVat();

      vat.set('a', 123);
      test.equal(vat.get('a'), 123);
      
      vat.die();
      test.done();

    },
    'Invoke `setnx` method against a key that exists': function (test) {

      var vat = EventVat();

      vat.set('a', 123);
      test.equal(vat.setnx('a', 'hi'), false);
      test.equal(vat.get('a'), 123);

      vat.die();
      test.done();

    },
    'Invoke `setnx` method against a key does not exist': function (test) {

      var vat = EventVat();

      test.equal(vat.setnx('a', 'hi'), true);;
      test.equal(vat.get('a'), 'hi');

      vat.die();
      test.done();

    },    
    'Invoke `getset` method and report returned value and stored value': function (test) {

      var vat = EventVat();

      test.equal(vat.get('foo'), null);
      vat.set('foo', 1);
      test.equal(vat.get('foo'), 1);

      test.equal(vat.getset('foo', 2), 1);
      test.equal(vat.get('foo'), 2);

      vat.die();
      test.done();

    },
    'Invoke `rename` method and get the value of the new key': function (test) {

      var vat = EventVat();

      vat.set('a', 'hello');
      vat.rename('a', 'b');
      test.equal(vat.get('a'), null);
      test.equal(vat.get('b'), 'hello');

      vat.die();
      test.done();

    },
    'Invoke `decr` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      test.equal(vat.decr('a'), 4);
      test.equal(vat.get('a'), 4);

      test.equal(vat.get('b'), null);
      test.equal(vat.decr('b'), -1);
      test.equal(vat.get('b'), -1);

      vat.die();
      test.done();

    },    
    'Invoke `incr` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      vat.incr('a');
      test.equal(vat.get('a'), 6);

      test.equal(vat.get('b'), null);
      test.equal(vat.incr('b'), 1);
      test.equal(vat.get('b'), 1);

      vat.die();
      test.done();

    },
    'Invoke `decrby` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      test.equal(vat.decrby('a', 3), 2);
      test.equal(vat.get('a'), 2);

      test.equal(vat.get('b'), null);
      test.equal(vat.decrby('b', 2), -2);
      test.equal(vat.get('b'), -2);

      vat.die();
      test.done();

    },    
    'Invoke `incrby` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      test.equal(vat.incrby('a', 4), 9);
      test.equal(vat.get('a'), 9);

      test.equal(vat.get('b'), null);
      test.equal(vat.incrby('b', 42), 42);
      test.equal(vat.get('b'), 42);

      vat.die();
      test.done();

    },
    
    
    'Invoke `swap` method and report value of both keys before and after': function (test) {
      
      var vat = EventVat();

      vat.set('a', 5);
      vat.set('b', 'hi');
      test.equal(vat.get('a'), 5);
      test.equal(vat.get('b'), 'hi');

      vat.swap('a', 'b');
      test.equal(vat.get('b'), 5);
      test.equal(vat.get('a'), 'hi');


      vat.die();
      test.done();
      
    },
    'Invoke `findin` method and report value': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'hello');
      test.equal(vat.findin('foo', 'll'), 2);

      vat.die();
      test.done();
      
    },
    'Invoke `del` method and report value before and after': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.set('key2', 'thing');
      test.equal(vat.get('foo'), 'bar');
      test.equal(vat.get('key2'), 'thing');

      test.equal(vat.del('foo', 'key2', 'key3'), 2);
      test.equal(vat.get('foo'), null);
      test.equal(vat.get('key2'), null);

      vat.die();
      test.done();
      
    },
    'Invoke `exists` method against a key that does not exist': function (test) {
      
      var vat = EventVat();

      test.equal(vat.exists('foo'), false);

      vat.die();
      test.done();
      
    },
    'Invoke `exists` method against a key that does exist': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'bar');
      test.equal(vat.exists('foo'), true);

      vat.die();
      test.done();
      
    },
    'Invoke `persist` method against a key and get the ttl': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'bar', 60);
      test.equal(vat.ttl('foo'), 60);

      vat.persist('foo');
      test.equal(vat.ttl('foo'), -1);

      vat.die();
      test.done();

    },
    'Invoke `randomkey` method and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.set('a', 1);
      vat.set('b', 2);
      vat.set('c', 3);

      var key = vat.randomkey();
      test.ok(key === 'foo' || key === 'a' || key === 'b' || key === 'c');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a String value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', 'bar');

      test.equal(vat.type('foo'), 'string');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a Number value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', 4);

      test.equal(vat.type('foo'), 'number');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a Boolean value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', true);

      test.equal(vat.type('foo'), 'boolean');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a List value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', [1, 2, 3]);

      test.equal(vat.type('foo'), 'list');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a Hash value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', { hello: 'world' });

      test.equal(vat.type('foo'), 'hash');

      vat.die();
      test.done();

    },
    'Invoke `append` method and report value before and after': function (test) {

      var vat = EventVat();

      vat.set('foo', 'hello');
      test.equal(vat.get('foo'), 'hello');

      test.equal(vat.append('foo', ' world!'), 12);
      test.equal(vat.get('foo'), 'hello world!');

      vat.die();
      test.done();

    },
    'Invoke `expire` method and report value after key expires': function(test) {

      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.expire('foo', 1);

      test.equal(vat.get('foo'), 'bar');
      test.equal(vat.ttl('foo'), 1);

      vat.on('del foo', function() {
        test.equal(vat.get('foo'), null);
        test.equal(vat.ttl('foo'), -1);
        vat.die();
        test.done();
      });
    },
    'Invoke `expireat` method and report value after key expires': function(test) {

      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.expireat('foo', Math.round(new Date() / 1000) + 1);

      test.equal(vat.get('foo'), 'bar');
      test.equal(vat.ttl('foo'), 1);

      vat.on('del foo', function() {
        test.equal(vat.get('foo'), null);
        test.equal(vat.ttl('foo'), -1);
        vat.die();
        test.done();
      });
    },
    'Invoke `keys` method and report keys returned': function(test) {

      var vat = EventVat();

      vat.set('foo1', 1);
      vat.set('foo2', 2);
      vat.set('foobar', 3);
      vat.set('ufoo', 4);

      test.deepEqual(vat.keys(/^foo/), ['foo1', 'foo2', 'foobar']);
      vat.die();
      test.done();

    },
    'Invoke `move` method and report keys in both databases before and after': function(test) {

      var vat = EventVat();
      var vat2 = EventVat();

      vat.set('foo', 42);

      test.equal(vat.get('foo'), 42);
      test.equal(vat2.get('foo'), null);

      vat.move('foo', vat2);

      test.equal(vat.get('foo'), null);
      test.equal(vat2.get('foo'), 42);

      vat.die();
      test.done();

    },
    'Invoke `randomkey` method and report key returned': function(test) {

      var vat = EventVat();

      vat.set('a', 1);
      vat.set('b', 2);
      vat.set('c', 3);

      var key = vat.randomkey();
      test.ok(key === 'a' || key === 'b' || key === 'c');

      vat.die();
      test.done();

    },
    'Invoke `getrange` method and return value': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!');
      test.equal(vat.getrange('foo', 6, 11), 'world');

      vat.die();
      test.done();

    },
    'Invoke `mget` method and return value': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!');
      vat.set('bar', 42);
      test.deepEqual(vat.mget('foo', 'bar'), ['hello world!', 42]);

      vat.die();
      test.done();

    },
    'Invoke `mset` method and report values': function(test) {

      var vat = EventVat();

      test.equal(vat.get('a'), null);
      test.equal(vat.get('b'), null);
      test.equal(vat.get('c'), null);

      vat.mset('a', 1, 'b', 2, 'c', 3);

      test.equal(vat.get('a'), 1);
      test.equal(vat.get('b'), 2);
      test.equal(vat.get('c'), 3);

      vat.die();
      test.done();
    },
    'Invoke `msetnx` method': function(test) {

      var vat = EventVat();

      test.equal(vat.get('a'), null);
      test.equal(vat.get('b'), null);
      test.equal(vat.get('c'), null);

      vat.set('foo', 'bar');
      test.equal(vat.msetnx('a', 1, 'b', 2, 'c', 3), true);

      test.equal(vat.get('a'), 1);
      test.equal(vat.get('b'), 2);
      test.equal(vat.get('c'), 3);

      vat.die();
      test.done();

    },
    'Invoke `msetnx` method with a key that already exists': function(test) {

      var vat = EventVat();

      test.equal(vat.get('a'), null);
      test.equal(vat.get('b'), null);
      test.equal(vat.get('c'), null);

      vat.set('b', 'bar');
      test.equal(vat.msetnx('a', 1, 'b', 2, 'c', 3), false);

      test.equal(vat.get('a'), null);
      test.equal(vat.get('b'), 'bar');
      test.equal(vat.get('c'), null);

      vat.die();
      test.done();

    },
    'Invoke `strlen` method': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!')
      test.equal(vat.strlen('foo'), 12);

      vat.die();
      test.done();

    },
    'Invoke `setrange` method and return value': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!');
      test.equal(vat.setrange('foo', 6, 'redis'), 12);

      vat.die();
      test.done();

    },
    'Invoke `hset` method and report `hget` value before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), null);
      vat.hset('foo', 'a', 'hello');
      test.equal(vat.hget('foo', 'a'), 'hello');

      test.equal(vat.hget('foo', 'b'), null);
      vat.hset('foo', 'b', 42);
      test.equal(vat.hget('foo', 'b'), 42);

      vat.die();
      test.done();
    },
    'Invoke `hexists` method and return value': function(test) {

      var vat = EventVat();

      test.equal(vat.hexists('foo', 'a'), false);
      vat.hset('foo', 'a', 'hello');
      test.equal(vat.hexists('foo', 'a'), true);
      test.equal(vat.hexists('foo', 'b'), false);

      vat.die();
      test.done();
    },
    'Invoke `hdel` method and report values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), null);
      test.equal(vat.hget('foo', 'b'), null);
      test.equal(vat.hget('foo', 'c'), null);

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);

      test.equal(vat.hget('foo', 'a'), 1);
      test.equal(vat.hget('foo', 'b'), 2);
      test.equal(vat.hget('foo', 'c'), 3);

      vat.hdel('foo', 'a', 'b');
      test.equal(vat.hget('foo', 'a'), null);
      test.equal(vat.hget('foo', 'b'), null);
      test.equal(vat.hget('foo', 'c'), 3);

      vat.die();
      test.done();

    },
    'Invoke `hgetall` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('bob', 'foo', 'bar');
      vat.hset('bob', 'hello', 'world');
      vat.hset('bob', 'answer', 42);
      test.deepEqual(vat.hgetall('bob'), { foo: 'bar', hello: 'world', answer: 42 });

      vat.die();
      test.done();

    },
    'Invoke `hdecr` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), null);
      test.equal(vat.hdecr('foo', 'a'), -1);
      test.equal(vat.hget('foo', 'a'), -1);

      vat.die();
      test.done();

    },
    'Invoke `hdecrby` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      vat.hset('bar', 'a', 5);
      test.equal(vat.hget('bar', 'a'), 5);
      test.equal(vat.hdecrby('bar', 'a', 3), 2);
      test.equal(vat.hget('bar', 'a'), 2);

      vat.die();
      test.done();

    },
    'Invoke `hincr` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), null);
      test.equal(vat.hincr('foo', 'a'), 1);
      test.equal(vat.hget('foo', 'a'), 1);

      vat.die();
      test.done();

    },
    'Invoke `hincrby` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      vat.hset('bar', 'a', 5);
      test.equal(vat.hget('bar', 'a'), 5);
      test.equal(vat.hincrby('bar', 'a', 3), 8);
      test.equal(vat.hget('bar', 'a'), 8);

      vat.die();
      test.done();

    },
    'Invoke `hkeys` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hkeys('foo'), ['a', 'b', 'c']);

      vat.die();
      test.done();

    },
    'Invoke `hlen` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hlen('foo'), 3);

      vat.die();
      test.done();

    },
    'Invoke `hvals` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hvals('foo'), [1, 2, 3]);

      vat.die();
      test.done();

    },
    'Invoke `hsetnx` method and report value before and after': function(test) {

      var vat = EventVat();

      vat.hget('foo', 'a', null);
      vat.hsetnx('foo', 'a', 42);
      vat.hget('foo', 'a', 42);

      vat.hsetnx('foo', 'a', 'hi');
      vat.hget('foo', 'a', 42);

      vat.die();
      test.done();

    },
    'Invoke `hmget` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hmget('foo', 'a', 'b', 'd'), [1, 2, null]);

      vat.die();
      test.done();

    },
    'Invoke `hmset` method and report values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), null);
      test.equal(vat.hget('foo', 'b'), null);
      test.equal(vat.hget('foo', 'c'), null);

      test.ok(vat.hmset('foo', 'a', 1, 'b', 2, 'c', 3));

      test.equal(vat.hget('foo', 'a'), 1);
      test.equal(vat.hget('foo', 'b'), 2);
      test.equal(vat.hget('foo', 'c'), 3);

      vat.die();
      test.done();
    },
    'Invoke `lpush` method and report return value and stored values': function(test) {

      var vat = EventVat();

      test.equal(vat.lpush('mylist', 'one'), 1);
      test.equal(vat.lpush('mylist', 'two'), 2);
      test.equal(vat.lindex('mylist', 0), 'two');
      test.equal(vat.lindex('mylist', 1), 'one');

      vat.die();
      test.done();

    },
    'Invoke `rpush` method and report return value and stored values': function(test) {

      var vat = EventVat();

      test.equal(vat.rpush('mylist', 'one'), 1);
      test.equal(vat.rpush('mylist', 'two'), 2);
      test.equal(vat.lindex('mylist', 0), 'one');
      test.equal(vat.lindex('mylist', 1), 'two');

      vat.die();
      test.done();

    },
    'Invoke `lset` and `lindex` methods and report return value and stored values': function(test) {

      var vat = EventVat();

      test.equal(vat.rpush('mylist', 'one'), 1);
      test.equal(vat.rpush('mylist', 'two'), 2);
      test.equal(vat.rpush('mylist', 'three'), 3);

      test.equal(vat.lindex('mylist', 0), 'one');
      test.equal(vat.lindex('mylist', 1), 'two');
      test.equal(vat.lindex('mylist', 2), 'three');

      test.ok(vat.lset('mylist', 0, 'four'));
      test.ok(vat.lset('mylist', -2, 'five'));
      test.ok(!vat.lset('mylist', 4, 'six'));
      test.ok(!vat.lset('mylist', -4, 'seven'));

      test.equal(vat.lindex('mylist', 0), 'four');
      test.equal(vat.lindex('mylist', 1), 'five');
      test.equal(vat.lindex('mylist', 2), 'three');

      vat.die();
      test.done();

    },
    'Invoke `llen` method and return value': function(test) {

      var vat = EventVat();

      vat.rpush('mylist', 'one');
      vat.rpush('mylist', 'two');
      vat.rpush('mylist', 'three');
      test.equal(vat.llen('mylist'), 3);

      vat.die();
      test.done();

    },
    'Invoke `lpushx` method and report return value and stored value': function(test) {

      var vat = EventVat();

      vat.lpush('mylist', 'one');
      test.equal(vat.lpushx('mylist', 'two'), 2);
      test.equal(vat.lindex('mylist', 0), 'two');

      test.equal(vat.lpushx('myotherlist', 'three'), 0);
      test.equal(vat.llen('myotherlist'), false);

      vat.die();
      test.done();

    },
    'Invoke `rpushx` method and report return value and stored value': function(test) {

      var vat = EventVat();

      vat.rpush('mylist', 'one');
      test.equal(vat.rpushx('mylist', 'two'), 2);
      test.equal(vat.lindex('mylist', 1), 'two');

      test.equal(vat.rpushx('myotherlist', 'three'), 0);
      test.equal(vat.llen('myotherlist'), false);

      vat.die();
      test.done();

    },
    'Invoke `lpop` method and report return value and stored values': function(test) {

      var vat = EventVat();

      vat.rpush('mylist', 'one');
      vat.rpush('mylist', 'two');

      test.equal(vat.lindex('mylist', 0), 'one');
      test.equal(vat.lindex('mylist', 1), 'two');
      test.equal(vat.lpop('mylist'), 'one');

      test.equal(vat.lindex('mylist', 0), 'two');
      test.equal(vat.lindex('mylist', 1), null);

      vat.die();
      test.done();
    },
    'Invoke `rpop` method and report return value and stored values': function(test) {

      var vat = EventVat();

      vat.rpush('mylist', 'one');
      vat.rpush('mylist', 'two');

      test.equal(vat.lindex('mylist', 0), 'one');
      test.equal(vat.lindex('mylist', 1), 'two');
      test.equal(vat.rpop('mylist'), 'two');

      test.equal(vat.lindex('mylist', 0), 'one');
      test.equal(vat.lindex('mylist', 1), null);

      vat.die();
      test.done();
    },
    'Invoke `rpoplpush` method and report return value and stored values': function(test) {

      var vat = EventVat();

      vat.rpush('mylist', 'one');
      vat.rpush('mylist', 'two');
      vat.rpush('mylist2', 'three');

      test.equal(vat.lindex('mylist', 0), 'one');
      test.equal(vat.lindex('mylist', 1), 'two');
      test.equal(vat.lindex('mylist2', 0), 'three');
      test.equal(vat.lindex('mylist2', 1), null);

      test.equal(vat.rpoplpush('mylist', 'mylist2'), 'two');

      test.equal(vat.lindex('mylist', 0), 'one');
      test.equal(vat.lindex('mylist', 1), null);
      test.equal(vat.lindex('mylist2', 0), 'two');
      test.equal(vat.lindex('mylist2', 1), 'three');

      vat.die();
      test.done();

    },
    'Invoke `lrem` method with positive count and report return and stored values': function(test) {

      var vat = EventVat();

      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      vat.rpush('list', 'two');
      vat.rpush('list', 'two');
      vat.rpush('list', 'three');
      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      test.equal(vat.llen('list'), 8);
      
      test.equal(vat.lrem('list', 3, 'one'), 3);
      test.equal(vat.llen('list'), 5);

      test.equal(vat.lrem('list', 2, 'three'), 1);
      test.equal(vat.llen('list'), 4);

      vat.die();
      test.done();

    },
    'Invoke `lrem` method with negative count and report return and stored values': function(test) {

      var vat = EventVat();

      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      vat.rpush('list', 'two');
      vat.rpush('list', 'two');
      vat.rpush('list', 'three');
      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      test.equal(vat.llen('list'), 8);
      
      test.equal(vat.lrem('list', -3, 'one'), 3);
      test.equal(vat.llen('list'), 5);

      test.equal(vat.lrem('list', -2, 'three'), 1);
      test.equal(vat.llen('list'), 4);

      vat.die();
      test.done();

    },
    'Invoke `lrem` method with 0 count and report return and stored values': function(test) {

      var vat = EventVat();

      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      vat.rpush('list', 'two');
      vat.rpush('list', 'two');
      vat.rpush('list', 'three');
      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      vat.rpush('list', 'one');
      test.equal(vat.llen('list'), 8);
      
      test.equal(vat.lrem('list', 0, 'one'), 5);
      test.equal(vat.llen('list'), 3);

      test.equal(vat.lrem('list', 0, 'three'), 1);
      test.equal(vat.llen('list'), 2);

      vat.die();
      test.done();

    },
    'Invoke `lrange` method and return value': function(test) {

      var vat = EventVat();

      vat.rpush('list', 'one');
      vat.rpush('list', 'two');
      vat.rpush('list', 'three');
      vat.rpush('list', 'four');

      test.deepEqual(vat.lrange('list', 2, 4), ['three', 'four']);
      test.deepEqual(vat.lrange('list2', 0, 3), []);

      vat.die();
      test.done();

    },
    'Invoke `ltrim` method and report new length and values stored': function(test) {

      var vat = EventVat();

      vat.rpush('list', 'one');
      vat.rpush('list', 'two');
      vat.rpush('list', 'three');
      vat.rpush('list', 'four');
      test.equal(vat.llen('list'), 4);

      vat.ltrim('list', 0, 3);
      test.equal(vat.llen('list'), 3);
      test.deepEqual(vat.lrange('list', 0, 100), ['one', 'two', 'three']);

      vat.die();
      test.done();

    },
    'Autoexpire should expire all keys after a specified length of time': function(test) {

      var vat = EventVat({
        autoexpire: 1
      });

      vat.set('foo', 'hello');
      vat.hset('bar', 'a', 'hello');

      vat.rpush('bazz', 'a');
      vat.rpush('bazz', 'b');

      vat.on('del', function() {
        if (Object.keys(vat.hash).length === 0) {
          test.done();
        }
      });

    },
    'Reconstitute a vat from a JSON object': function(test) {

      var vat1 = EventVat();

      vat1.set('foo', 'a', 1);
      vat1.hset('bar', 'a', 1);

      vat1.rpush('bazz', 'a');
      vat1.rpush('bazz', 'b');

      var vat2 = EventVat({
        data: vat1.dump()
      });

      test.equal(vat2.get('foo'), 'a');
      test.equal(vat2.llen('bazz'), 2);
      test.equal(vat2.hget('bar', 'a'), 1);

      test.done();

    },
};
