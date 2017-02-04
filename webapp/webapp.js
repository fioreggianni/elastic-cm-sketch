var config = require('../config.js')
var express = require('express')
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

function getNews(){
	return newsfeed.getNews(config.webapp.defaults.news.source)
}

function checkTrackerHealth(suspectingFault){
	return new Promise(function(resolve, reject){
		memoryCache.get("tracker-health", function(err, val){
			if (!suspectingFault && val) {
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

function getStats(id){
	return new Promise(function(resolve, reject){
		return getTrackerHealth()
		.then(function(healthy){
			if (healthy){
				return request.get(S("{{baseurl}}/hits?{{params}}").template({
						baseurl: config.tracker.app.uri.full(),
						params: querystring.stringify({
							id: id
						})
					}).s,
					function (err, response, body) {
						if (!err && response.statusCode == 200) {
							return resolve(JSON.parse(body).hits);
						} else checkTrackerHealth(true);
						console.log("error: %s hits: %s", err, JSON.parse(body).hits)
						return resolve(0)
					});
			}
			console.log("rejecting as not healthy")
			return reject("unavailable")
		})
		.catch(function(err){
			console.log("error while getting tracker health, %s", err)
			return reject(err)
		})
	});
}

function downloadStats(){
	getNews()
	.then(function(news){
		news.forEach(function(article){
			getStats(article.id)
			.then(function(hits){
				return newsfeed.setStats(article.id, {
					hits: hits
				})
				.catch(function(err){
					console.log("could not update stats to news item: %s", err)
				})
			})
			.catch(function(err){
				console.log("could not get stats for article %s: %s", JSON.stringify(article), err)
			})

		})
	})
	.catch(function(err){
		console.log("could not list news: %s", err)
	})
}
function track(id, referer){
	 return new Promise(function(resolve, reject){
        var body = {
            id: id,
			referer: referer
        }
		return getTrackerHealth()
		.then(function(healthy){
			if (healthy) {
				return request({
					url: S("{{baseurl}}/track").template({
						baseurl: config.tracker.app.uri.full(),
					}).s,
					method: 'POST',
					json: body
				},
				function (err, response, body) {
					if (!err && response.statusCode == 200) {
						return resolve();
					} else checkTrackerHealth(true);
					console.log("err: %s, code: %s",err, JSON.stringify(response))
					return resolve()
				});
			} else return resolve()
		})
		.catch(function(err){
			console.log("error while calling tracker %s", err)
			return reject(err)}
		)
        
    })
}

var app = express()
app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next()
})

app.get('/', function (req, res) {
  res.send('Here is %s the web server', config.webapp.app.name)
})


app.get('/news', function (req, res) {
	getNews()
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
			track(newsid, referer)
			.catch(function(err){
				console.log("APP error while tracking: "+err)
			})
			res.status(200).send(news)
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
	setInterval(newsfeed.download, 30000)
	downloadStats()
	setInterval(downloadStats, 5000)
})

