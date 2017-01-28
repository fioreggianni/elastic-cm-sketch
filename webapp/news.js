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

function titles(source){
    return getCached(source);
}

function get(id){
    return new Promise(function(resolve, reject){
        return memoryCache.get(id, function(err, result){
            if (err || !result) return reject()
            return resolve(JSON.parse(result))
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
        return memoryCache.get(source, function(err, result){
            return resolve( (err || !result) ? [] : JSON.parse(result))
        })
    })
}

function download(){
    config.newsapi.sources.forEach(function(source){
        Promise
        .all([pull(source), getCached(source)])
        .then(function(results) {
            var downloaded = results[0]
            var cached = results[1]
            if (downloaded) {
                downloaded.forEach(function(news){
                    var hash = S(crypto.createHash('md5')
                        .update(news.title)
                        .digest('hex'))
                            .left(5).s;
                    if (!cached.find(function(cn){ return cn.hash === hash })) {
                        cached.push({ hash: hash, title: news.title})
                        memoryCache.set(hash, JSON.stringify(news), { ttl: config.defaults.news.ttl })
                        memoryCache.set(source, JSON.stringify(cached), { ttl: config.defaults.news.ttl })
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
    titles: titles
}
