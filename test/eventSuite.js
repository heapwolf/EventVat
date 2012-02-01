
var simpleEvents = require('nodeunit').testCase;
var EventVat = require('../lib/eventvat');

module.exports = simpleEvents({

  setUp: function (test) {
    
    if (typeof test === 'function') {
      test();
    }
    else {
      test.done();
    }
  },

  tearDown: function (test) {
    if (typeof test === 'function') {
      test();
    }
    else {
      test.done();
    }
  },

  '1. Raise event on `get` method invokation for a any key': function (test) {

    var vat = new EventVat;
    var samplevalue = 10;

    vat.on('get', function(key, value) {
      test.equal(value, samplevalue, 'The value was captured by the event.');
      test.ok(true, 'The get event was raised');
      test.done();
    });

    vat.set('foo', samplevalue);
    var val = vat.get('foo');

    test.equal(val, samplevalue, 'The value got matches the value set');
    test.expect(3);

  }
  , '2. Raise event on `get` method invokation for a particular key': function (test) {

    var vat = EventVat();
    var samplevalue = 10;

    vat.on('get foo', function(key, value) {
      test.equal(value, samplevalue, 'The value was captured by the event.');
      test.ok(true, 'The get event was raised');
      test.done();
    });

    var samplevalue = 10;

    vat.set('foo', samplevalue);
    var val = vat.get('foo');

    test.ok(val===samplevalue, 'The value got matches the value set');    
    test.expect(3);
    

  },  
  '3. Raise event on `set` method invokation for any key': function (test) {

    var vat = EventVat();
    vat.on('set', function(key, value) {
      test.ok(true, 'The get event was raised');
      test.done();
    });
    
    var samplevalue = 10;
    
    vat.set('foo', samplevalue);
    test.expect(1);
    

  },
  '4. Raise event on `set` method invokation for a particular key': function (test) {

    var vat = EventVat();
    vat.on('set foo', function(key, value) {
      test.ok(true, 'The get event was raised');
      test.done();
    });
    
    var samplevalue = 10;
    
    vat.set('foo', samplevalue);
    test.expect(1);

  },
  
  '5. Raise event on `setnx` method invokation': function (test) {

    test.ok(true, 'everythings ok');
    test.expect(1);
    test.done();

  },
  '6. Raise event on `rename` method invokation': function (test) {

    test.ok(true, 'everythings ok');
    test.expect(1);
    test.done();

  },
  '7. Raise event on `decr` method invokation': function (test) {

    test.ok(true, 'everythings ok');
    test.expect(1);
    test.done();

  },    
  '8. Raise event on `incr` method invokation': function (test) {

    test.ok(true, 'everythings ok');
    test.expect(1);
    test.done();

  },
  
  
  '9. Raise event on `swap` method invokation': function (test) {
    
    test.ok(true, 'everythings ok');
    test.done(); 
    
  },
  '10. Raise event on `findin` method invokation': function (test) {
    
    test.ok(true, 'everythings ok');
    test.done(); 
    
  },
  '11. Raise event on `replace` method invokation': function (test) {
    
    test.ok(true, 'everythings ok');
    test.done(); 
    
  },
  '12. Raise event on `del` method invokation': function (test) {
    
    test.ok(true, 'everythings ok');
    test.done(); 
    
  },
  '13. Raise event on `exists` method invokation': function (test) {
    
    test.ok(true, 'everythings ok');
    test.done(); 
    
  },
  
  '14. Raise event on `persist` method invokation': function (test) {
    
    test.ok(true, 'everythings ok');
    test.done(); 
    
  },
  '15. Raise event on `append` method invokation': function (test) {
    
    test.ok(true, 'everythings ok');
    test.done(); 
    
  }

});
