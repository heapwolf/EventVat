var EventVat = require('../lib/eventvat');

this.methodSuite = {
    'Invoke `get` method and return value': function (test) {

      var vat = EventVat();

      test.equal(vat.get('a'), false);
      
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
      vat.setnx('a', 'hi');
      test.equal(vat.get('a'), 123);

      vat.die();
      test.done();

    },
    'Invoke `setnx` method against a key does not exist': function (test) {

      var vat = EventVat();

      vat.setnx('a', 'hi');
      test.equal(vat.get('a'), 'hi');

      vat.die();
      test.done();

    },    
    'Invoke `rename` method and get the value of the new key': function (test) {

      var vat = EventVat();

      vat.set('a', 'hello');
      vat.rename('a', 'b');
      test.equal(vat.get('a'), false);
      test.equal(vat.get('b'), 'hello');

      vat.die();
      test.done();

    },
    'Invoke `decr` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      vat.decr('a');
      test.equal(vat.get('a'), 4);

      vat.die();
      test.done();

    },    
    'Invoke `incr` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      vat.incr('a');
      test.equal(vat.get('a'), 6);

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
      test.equal(vat.get('foo'), false);
      test.equal(vat.get('key2'), false);

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
    'Invoke `type` method on a key containing a Array value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', [1, 2, 3]);

      test.equal(vat.type('foo'), 'array');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a Object value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', { hello: 'world' });

      test.equal(vat.type('foo'), 'object');

      vat.die();
      test.done();

    },
    'Invoke `append` method and report value before and after': function (test) {

      var vat = EventVat();

      vat.set('foo', 'hello');
      test.equal(vat.get('foo'), 'hello');

      vat.append('foo', ' world!');
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
        test.equal(vat.get('foo'), false);
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
        test.equal(vat.get('foo'), false);
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
      test.equal(vat2.get('foo'), false);

      vat.move('foo', vat2);

      test.equal(vat.get('foo'), false);
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
};
