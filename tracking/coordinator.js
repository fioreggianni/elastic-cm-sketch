var config = require('../config.js').tracker
var express = require('express')
var app = express()
var port = process.env.PORT || config.app.uri.port

app.get('/', function (req, res) {
  res.send('Here is Connor the coordinator')
})

app.get('/track', function(req, res){
  var id = req.query.id
  var referer = req.query.referer
  console.log("tracking referer: '%s' for news id #%s", referer, id)
  res.status(200).send("tracked")
})

app.listen(config.app.uri.port, function () {
  console.log('Elastic coordinator Connor listening on port %s.',config.app.uri.port)
})