
var emitter = new Memvat;

emitter.on('name', function(first, last){
    console.log(first + ', ' + last);
});

emitter.get();

emitter.emit('name', 'a', 'aeeeeeeeeee');
emitter.emit('name', 'b', 'beee');