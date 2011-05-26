
var m = new Memvat;

m.on('get', 'foo', function(key, value) {
  console.log(key, value);
});

m.set('foo', 'bar');

m.get('foo');

