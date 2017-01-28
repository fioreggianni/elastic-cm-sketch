var config = require('../config.js')
var express = require('express')
var app = express()
var port = process.env.PORT || config.webapp.app.uri.port
const querystring = require('querystring')
var newsfeed = require('./news.js')
var Promise = require('promise')
var request = require('request')
var S = require('string')
var cacheManager = require('cache-manager')
var memoryCache = cacheManager.caching({ 
    store: 'memory', 
    promiseDependency: Promise
})

function checkTrackerHealth(suspectingFault){
	console.log("checking tracking health ...")
	return new Promise(function(resolve, reject){
		memoryCache.get("tracker-health", function(err, val){
			if (!suspectingFault && val) {
				console.log("solved with fast check")
				return resolve()
			}
			request({
				uri: S("{{baseurl}}/ping").template({
					baseurl: config.tracker.app.uri.full()
				}).s,
				timeout: 500
			}, function(err, response, body){
				if (err || response.statusCode != 200) {
					memoryCache.set("tracker-health", false, function(x, result){
						return reject()
					})
				} else {
					memoryCache.set("tracker-health", true, function(x, result){
						return resolve()
					})
				}
			})
		})
	})
}

function getTrackerHealth(){
	return new Promise(function(resolve, reject){
		memoryCache
		.get("tracker-health", function(err, val){
			return resolve(val ? true : false)
		})
	})
}

function track(id, referer){
	 return new Promise(function(resolve, reject){
        var params = {
            id: id,
			referer: referer
        }
		return getTrackerHealth()
		.then(function(healthy){
			if (healthy) {
				return request({
					uri: S("{{baseurl}}/track?{{params}}").template({
						baseurl: config.tracker.app.uri.full(),
						params: querystring.stringify(params)
					}).s,
					timeout: 500
				}, 
					function (err, response, body) {
						if (!err && response.statusCode == 200) {
							return resolve();
						}
						checkTrackerHealth(true);
						return resolve()
				});
			} else return resolve()
		})
        
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
			res.status(200).send(news)
			track(newsid, referer)
			.catch(function(err){
				console.log("APP error while tracking: "+err)
			})
	})
	.catch(function(err){
		res.status(404).send()
	})
})

app.get('/ping', function(req, res){
  res.status(200).send();
})

app.listen(port, function () {
  	console.log('Webserver %s listening on port %s.', config.webapp.app.name, config.webapp.app.uri.port)
	checkTrackerHealth()
	setInterval(checkTrackerHealth, 15000)
	newsfeed.download()
	setInterval(newsfeed.download, 10000)
})

