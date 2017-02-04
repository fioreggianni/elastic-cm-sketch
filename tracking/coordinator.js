var config = require('../config.js').tracker
var express = require('express')
var port = process.env.PORT || config.app.uri.port
var bodyParser = require('body-parser');
var app = express()
var cacheManager = require('cache-manager')
var memoryCache = cacheManager.caching({ 
    store: 'memory', 
    promiseDependency: Promise
})

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next()
})

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.status(200).send('Here is Connor the coordinator')
})

app.get('/hits', function(req, res){
  var id = req.query.id
  //console.log("asked for hits of %s", id)
  memoryCache
  .get(id)
  .then(function(stats){
    //console.log("found stats %s", JSON.stringify(stats))
    var hits = 0
    if (stats) hits = JSON.parse(stats).hits
    res.status(200).send({
      hits: hits
    })
  })
  .catch(function(err){
    console.log("error while getting counter data, err: %s", err)
    res.status(500).send("cannot get stats")
  })
})

app.post('/track', function(req, res){
  var id = req.body.id
  var referer = req.body.referer
  console.log("TRACKER tracking news #%s with referer: '%s'", id, referer)
  memoryCache
  .get(id)
  .then(function(stats){
    stats = stats ? JSON.parse(stats) : { hits: 0 }
    stats.hits = (stats.hits || 0) + 1
    return memoryCache
    .set(id, JSON.stringify(stats))
    .then(function(){
      res.status(200).send("tracked. total hits: "+ stats.hits)
    })
    .catch(function(err){
      console.log("error while incrementing counter: %s",err);
      res.status(500).send("untracked: could not increment counter")
    })
  })
  .catch(function(err){
    console.log("error while getting counter data: %s", err)
    res.status(500).send("untracked: could not init counter")
  })
})

app.get('/ping', function(req, res){
  res.status(200).send();
})

app.listen(config.app.uri.port, function () {
  console.log('Elastic coordinator Connor listening on port %s.',config.app.uri.port)
})