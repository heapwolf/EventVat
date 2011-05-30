var eyes = require('eyes');

EventEmitter = function(conf) {
  if(conf) {
    
    if(conf.delimiter === '*') {
      throw new Error('The event can not be delimited by the "*" (wild-card) character.')
    }

  }
  this._delimiter = conf ? conf.delimiter : '/';
  this._events = {};
};

EventEmitter.prototype.isArray = function(v) {
  return ~({}).toString.call(v).indexOf('Array');
}

EventEmitter.prototype.addListener = function(event, listener, ttl) {

  var name, ns = this._events;

  // Signal that a new listener is being added.
  this.emit('newListener', event, listener);

  // the name has a delimiter
  if(~event.indexOf(this._delimiter)) {

    //split the name into an array
    name = event.split(this._delimiter);
    
    // continue to build out additional namespaces and attach the listener to them
    while(name.length) {
      
      // get the namespace
      var n = name.shift();
      ns = ns[n] || (ns[n] = {});
      
      // if this is a wild card or the completed ns, add the event
      if(name.length === 0) { 
        ns._listeners ? ns._listeners.push(listener) : ns._listeners = [listener];
        ns._ttl = ttl;
        ns._ttd = 0;
      }
    }
  }
  
  // if the name does not have a delimiter
  else {

    // get a handle to the event
    var e = ns[event] || (ns[event] = {});

    e._listeners ? e._listeners.push(listener) : e._listeners = [listener];
    e._ttl = ttl;
    e._ttd = 0;
  }

};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function() {
  this.addListener(arguments, 1);
};

EventEmitter.prototype.emit = function(event) {

  // get all the args except the event, make it a real array
  var args = [].slice.call(arguments).slice(1);

  // if there is a delimiter in the event name
  if(~event.indexOf(this._delimiter)) {

    //split the name into an array
    name = event.split(this._delimiter);

    var explore = [this._events],
        invoked = false;
        
    for (var i = 0; i < name.length; i++) {
      //
      // Iterate over the parts of the potentially namespaced
      // event. 
      //
      //     emit('foo/*/bazz') ==> ['foo', '*', 'bazz'] 
      //
      var part = name[i], newSets = [], removeAt = [];
      
      for (var j = 0; j < explore.length; j++) {
        //
        // Iterative "unkown" set exploration: Iterate over each "unknown"
        // set of objects in the events tree. If a wildcard is discovered, 
        // append that object to the unknown set and continue exploration.
        //
        var ns = explore[j];
        require('eyes').inspect(explore, part);
        
        if (i === name.length - 1) {
          //
          // Then if we are at the end of the iteration
          // invoke all of the listeners, if not, continue
          // iterating deeper in the object
          //
          if (part === '*') {
            for (var key in ns) {
              for (var k = 0; k < ns[key]._listeners.length; k++) {
                ns[key]._listeners[k].apply(this, args);
              }
            }
            invoked = true;
          }
          else {
            if (ns[part]) {
              for (var k = 0, l = ns[part]._listeners.length; k < l; k++) {
                ns[part]._listeners[k].apply(this, args);
              }
              invoked = true;
            }
            
            if (ns['*']) {
              for (var k = 0, l = ns['*']._listeners.length; k < l; k++) {
                ns['*']._listeners[k].apply(this, args);
              }
              invoked = true;
            }
          }
        }
        else {
          if (part !== '*') {
            if (!ns[part] && !ns['*']) {
              //
              // If it's not a wild card and there isn't a wild
              // card stored and the exact key isn't at the 
              // next step of the events object, break out 
              // of the loop and end evaluation.
              //
              continue;
            }

            if (ns[part]) {
              //
              // If it's not a wild card, but there is an exact
              // match for this part of the namespaced event.
              //
              if (ns['*']) {
                newSets.push(ns['*']);
              }

              explore[j] = explore[j][part];
            }
            else if (ns['*']) {
              //
              // If the part of the namespaced event is not a wildcard,
              // but the set we are currently exploring has a wildcard
              // at this level, nest deeper for that particular set.
              //
              explore[j] = explore[j]['*'];
            }
          } 
          else {
            //
            // Otherwise, this part of the namespaced event is a 'wildcard',
            // in which case, we iterate over the keys of the current set,
            // and add those objects to the set to be added to the "unknown" set
            // after this level of exploration has completed.
            //
            for (var key in ns) {
              if (ns.hasOwnProperty(key)) {
                newSets.push(ns[key]);
              }
            }

            removeAt.push(j);
          }
        }
      }
      
      for (var j = 0; j < removeAt.length; j++) {
        //
        // Remove stale sets that are no longer of interest.
        //
        explore.splice(j, 1);
      }
      
      if (newSets.length) {
        //
        // If this level of exploration has yielded any new sets
        // to be explored, then concatenate those sets to the "unknown" sets.
        //
        explore = explore.concat(newSets);
      } 
    }
    
    return invoked;
  }

  // if the name does not have a delimiter
  else {
    
    if (!this._events[event]) {
      return false;
    }
    
    // get a handle to the listeners
    var listeners = this._events[event]._listeners || null;
    
    if (!listeners) {
      return false;
    }
    
    // fire off each of them
    for(var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    
  }
  
}

EventEmitter.prototype.removeListener = function() {};
EventEmitter.prototype.removeAllListeners = function() {};

EventEmitter.prototype.listeners = function() {};

// test

var vat = new EventEmitter({ delimiter: ':' });


vat.on('foo:*', function () { 
  eyes.inspect(arguments, 'foo:*');
});

// vat.on('foo:*:bar', function () {
//   eyes.inspect(arguments, 'foo:*:bar');
// });
// 
// vat.on('foo:*:*', function () {
//   eyes.inspect(arguments, 'foo:*:*');
// });
// 
// vat.on('foo:bar:bar', function () {
//   eyes.inspect(arguments, 'foo:bar:bar')
// });


console.log('start');

vat.emit('foo:box:bar', 1, 2, 3, 4);
vat.emit('foo:bar:*', 5, 6, 7, 8);

  // -> foo/*/bar/*/aff
  //     |  |   | |   |
  //     |  |   | |   |
  //     |  |   | |   |
  //     |  |   | |   |
  //     |  |   | |   |
  // -> foo/x/bar/x/aff
  //        |     |   |
  //        e     e   e

  // FAIL
  
  //    foo/*/bar/*/aff
  //     |  |   | |   |
  //     |  |   | e   e
  //     |  |   |
  //     m  |   m
  //     |  |   |
  // -> foo/x
  //        |
  //        e
  
  // FAIL
  
  //    foo/*
  //     |  | 
  //     |  | 
  //     |  | 
  //     m  | 
  //     |  | 
  // -> foo
  //        |
  //        e




// vat.on('foo/*/bar/*/aff', function(a, b) {
//   console.log('event 1 fired with', value);
// });
// 
// vat.on('foo', function(a, b) {
//   console.log('event 1 fired with', value);
// });
// 
// // vat.on('fxoo/bar', function(a, b) {
// //   console.log('event 2 fired with', a , b);
// // });
// 
// //vat.emit('foo', 'arg1', 'arg2');
// vat.emit('foo/bar', 'with bar');
// vat.emit('foo/bazz', 'with bazz');
// 
// 
// 
// // vat.on('foo', function(a, b) {
// //   console.log('event 1 fired with', a , b);
// // });
// // 
// // vat.on('foo', function(a, b) {
// //   console.log('event 2 fired with', a , b);
// // });
// // 
// // vat.emit('foo', 'arg1', 'arg2');
// 
// // console.log(vat._events)
// 
// console.log('done');
// 
// 
// 
