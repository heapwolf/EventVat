
this.eventSuite = {
  '1. Raise event on `get` method invokation for a any key': function (test) {

      vat.on('get', function(key, value) {
        test.ok(true, 'The get event was raised');
      });

      var samplevalue = 10;

      vat.set('foo', samplevalue);
      var val = vat.get('foo');

      //test.ok(val===samplevalue, 'The value got matches the value set');
      test.done();

  },
  '2. Raise event on `get` method invokation for a particular key': function (test) {

      vat.on('get', 'foo', function(key, value) {
        console.log('2', key, value);
        test.ok(true, 'The get event was raised');
      });
      
      var samplevalue = 10;
      
      vat.set('foo', samplevalue);
      var val = vat.get('foo');
      
      //test.ok(val===samplevalue, 'The value got matches the value set');
      test.done();

  },  
  '3. Raise event on `set` method invokation for any key': function (test) {

    vat.on('set', function(key, value) {
      test.ok(true, 'The get event was raised');
    });
    
    var samplevalue = 10;
    
    vat.set('foo', samplevalue);
    test.done();

  },
  '4. Raise event on `set` method invokation for a particular key': function (test) {
    
    vat.on('set', 'foo', function(key, value) {
      test.ok(true, 'The get event was raised');
    });
    
    var samplevalue = 10;
    
    vat.set('foo', samplevalue);
    test.done();

  },
  
  '5. Raise event on `setnx` method invokation': function (test) {

    test.ok(true, 'everythings ok');
    test.done();

  },
  '6. Raise event on `rename` method invokation': function (test) {

    test.ok(true, 'everythings ok');
    test.done();

  },
  '7. Raise event on `decr` method invokation': function (test) {

    test.ok(true, 'everythings ok');
    test.done();

  },    
  '8. Raise event on `incr` method invokation': function (test) {

    test.ok(true, 'everythings ok');
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
  

};
