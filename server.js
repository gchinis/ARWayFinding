var express = require('express');
var app = express();

app.use(express.static('public'));

app.set('port', process.env.PORT || 8081);

var server = app.listen(app.get('port'), function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Listening at http://%s:%s", host, port)
})
