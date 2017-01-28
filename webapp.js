var express = require('express')
var app = express()
var port = process.env.PORT || 8080
var config = require('./config.js').webapp
const querystring = require('querystring')
var newsfeed = require('./webapp/news.js')
var Promise = require('promise')

app.get('/', function (req, res) {
  res.send('Here is %s the web server', config.app.name)
})


app.get('/news', function (req, res) {
	newsfeed.titles(config.defaults.news.source)
	.then(function(news){
		res.status(200).send(news)
	})
	.catch(function(err){
		res.status(500).send(err);
	})
})

app.get('/news/:id', function(req, res){
	var newsid = req.params.id;
	newsfeed.get(newsid)
	.then(function(news){
		res.status(200).send(news)
	})
	.catch(function(err){
		res.status(404).send()
	})
})

app.listen(port, function () {
  console.log('Webserver %s listening on port %s.', config.app.name, port)
	newsfeed.download()
	setInterval(newsfeed.download, 10000)
})