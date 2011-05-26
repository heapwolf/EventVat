
var vat = new EvtVat;

console.log('start')

// m.on('get', 'foo', function(key, value) {
//   console.log(key, value);
// });

vat.on('get', function(key, value) {
  console.log('>>>'+key, value);
});

vat.set('foo', 'bar');

vat.get('foo');

console.log('done')