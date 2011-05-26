
var m = new Memvat;

console.log('start')

// m.on('get', 'foo', function(key, value) {
//   console.log(key, value);
// });

m.on('get', function(key, value) {
  console.log('>>>'+key, value);
});

m.set('foo', 'bar');

m.get('foo');

console.log('done')