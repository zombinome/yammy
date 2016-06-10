# yammy
Simple db query result materializing framework

Use it as
```Javascript
var yammy = new Yammy([new YammyMySqlAdapter(options)]);

yammy.query('SELECT * FROM orders')
    .usingAdapter('mysql')
    .execute(null, function (orders) {
        // Do some reading here
    });
```
