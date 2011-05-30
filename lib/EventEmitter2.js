
EventEmitter = function(conf) {
  if(conf) {
    
    if(conf.delimiter === '*') {
      throw new Error('The event can not be delimited by the "*" (wild-card) character.')
    }

  }
  this._delimiter = conf ? conf.delimiter : '/';
  this._events = [];
};

EventEmitter.prototype.addListener = function(event, listener, ttl) {

  var name, ns = this._events;

  // Signal that a new listener is being added.
  //this.emit('newListener', event, listener);

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
      if(n === '*' || name.length === 0) { 
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

    // if there is a wildcard in the event
    if(~event.indexOf('*')) {
      
    }

    // there is no delimiter in the event
    else {

      var ns = this._events;

      while(name.length) {

        // get the namespace
        var n = name.shift();
        
        ns = ns[n] || (ns[n] = {});

        // if the ttd is less than the ttl

        if(name.length === 0) {
          // fire off each of the events
          
          if(!ns._listeners || ns._listeners.length === 0) {
            throw new Error('There are no listeners on the name ' + event +'.');
          }          
          
          for(var i = 0, l = ns._listeners.length; i < l; i++) {
            ns._listeners[i].apply(this, args);
          }
        }
      }
    }
  }

  // if the name does not have a delimiter
  else {
    
    if(!this._events[event]) {
      throw new Error('There are no events by the name ' + event +'.');
    }
    
    // get a handle to the listeners
    var listeners = this._events[event]._listeners || null;
    
    if(!listeners) {
      throw new Error('There are no listeners on the name ' + event +'.');
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

var vat = new EventEmitter;

console.log('start');

vat.on('foo/*/bar/*/aff', function(a, b) {
  console.log('event 1 fired with', value);
});

vat.on('foo', function(a, b) {
  console.log('event 1 fired with', value);
});

// vat.on('fxoo/bar', function(a, b) {
//   console.log('event 2 fired with', a , b);
// });

//vat.emit('foo', 'arg1', 'arg2');
vat.emit('foo/bar', 'with bar');
vat.emit('foo/bazz', 'with bazz');


// vat.on('foo', function(a, b) {
//   console.log('event 1 fired with', a , b);
// });
// 
// vat.on('foo', function(a, b) {
//   console.log('event 2 fired with', a , b);
// });
// 
// vat.emit('foo', 'arg1', 'arg2');

// console.log(vat._events)

console.log('done');



