var config = require('../config.js')
var express = require('express')
var app = express()
var port = process.env.PORT || config.webapp.app.uri.port
const querystring = require('querystring')
var newsfeed = require('./news.js')
var Promise = require('promise')
var request = require('request')
var S = require('string')

function track(id, referer){
	 return new Promise(function(resolve, reject){
        var params = {
            id: id,
			referer: referer
        }
		console.log(config.tracker.app.uri.full())
        return request(S("{{baseurl}}track?{{params}}").template({
            baseurl: config.tracker.app.uri.full(),
            params: querystring.stringify(params)
        }).s, 
            function (err, response, body) {
				if (!err && response.statusCode == 200) {
					return resolve();
				} else {
					return reject("Could not track route due to: "+err)
				}
        });

    })
}

app.get('/', function (req, res) {
  res.send('Here is %s the web server', config.webapp.app.name)
})


app.get('/news', function (req, res) {
	newsfeed.titles(config.webapp.defaults.news.source)
	.then(function(news){
		res.status(200).send(news)
	})
	.catch(function(err){
		res.status(500).send(err);
	})
})

app.get('/news/:id', function(req, res){
	var newsid = req.params.id
	var referer = req.query.referer
	newsfeed.get(newsid)
	.then(function(news){
		return track(newsid, referer)
		.then(function(){
			res.status(200).send(news)
		})
		.catch(function(err){
			console.log("error while tracking: "+err)
			res.status(200).send(news)
		})		
	})
	.catch(function(err){
		res.status(404).send()
	})
})

app.listen(port, function () {
  	console.log('Webserver %s listening on port %s.', config.webapp.app.name, config.webapp.app.uri.port)
	newsfeed.download()
	setInterval(newsfeed.download, 10000)
})