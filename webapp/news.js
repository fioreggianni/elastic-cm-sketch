/* 
leveraging http://newsapi.org to get news
*/

var config = require("../config.js").webapp
var S = require("string")
var Promise = require("promise")
var request = require("request")
const querystring = require("querystring")
var crypto = require('crypto');
var cacheManager = require('cache-manager')
require('array.prototype.find').shim()

var memoryCache = cacheManager.caching({ 
    store: 'memory', 
    promiseDependency: Promise,
    ttl: 600 /*seconds*/
})

function getNews(source){
    return new Promise(function(resolve, reject){
        getCached(source)
        .then(function(ids){
            var promises = []
            //console.log("result from getCached(%s): %s", source, JSON.stringify(ids))
            ids.forEach(function(id){
                promises.push(get(id))
            })
            Promise
            .all(promises)
            .then(function(results){
                //console.log("cached news: "+JSON.stringify(results))
                return resolve(results)
            })
            .catch(function(err){
                console.log("could not resolve all get promises: %s", err)
                return reject(err)
            })
        })
        .catch(reject);
    })

}

function get(id){
    return new Promise(function(resolve, reject){
        return memoryCache
        .get(id)
        .then(function(result){
            //console.log("result is %s", JSON.stringify(result))
            return resolve(JSON.parse(result))
        })
        .catch(function(err){
            console.log("could not get id %s due to %s", JSON.stringify(id), err)
            return reject(err)
        })
    })
}

function pull(source) {
    return new Promise(function(resolve, reject){
        var params = {
            source: source || config.defaults.news.source,
            apiKey: config.newsapi.apikey,
            sortBy: "top"
        }
        request(S("{{baseurl}}/articles?{{params}}").template({
            baseurl: config.newsapi.url.full(),
            params: querystring.stringify(params)
        }).s, 
            function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var response = JSON.parse(body)
                return resolve(response.articles);
            } else {
                console.log("code: "+JSON.stringify(response))
                return reject(error)
            }
        });

    })
}

function getCached(source){
    return new Promise(function(resolve, reject){
        return memoryCache
        .get(source)
        .then(function(result){
            return resolve(result ? JSON.parse(result) : [])
        })
        .catch(reject)
    })
}

function setStats(id, stats){
    return new Promise(function(resolve, reject){
        return get(id)
        .then(function(article){
            //console.log("setStats article got is %s", JSON.stringify(article))
            article.stats = stats
            return memoryCache
            .set(id, JSON.stringify(article))
            .then(resolve)
        })
        .catch(reject)
    })
}

function download(){
    config.newsapi.sources.forEach(function(source){
        Promise
        .all([pull(source), getCached(source)])
        .then(function(results) {
            var downloaded = results[0]
            var cached = results[1]
            //console.log("downloaded: %s, cached: %s", JSON.stringify(downloaded), JSON.stringify(cached))
            if (downloaded) {
                downloaded.forEach(function(news){
                    var hash = S(crypto.createHash('md5')
                        .update(news.title)
                        .digest('hex'))
                            .left(5).s;
                    if (!cached.find(function(h){ return h === hash })) {
                        cached.push(hash)
                        memoryCache.set(hash, JSON.stringify({
                            id: hash,
                            title: news.title,
                            img: news.urlToImage,
                            stats: {
                                hits: 0
                            }
                        }))
                        memoryCache.set(source, JSON.stringify(cached))
                        console.log("adding news #%s :%s from source %s", hash, news.title, source)
                    }
                })
            }
        })
        .catch(function(err){
            console.log("Could not download news from source %s due to the following error: %s", source, err)
        })
    })
}

module.exports = {
    get: get,
    download: download,
    getNews: getNews,
    setStats: setStats
}
