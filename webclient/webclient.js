var config = require('../config.js')
var Promise = require('promise')
var request = require('request')
var S = require('string')

function getNews(){
    return new Promise(function(resolve, reject){
        request(S('{{baseurl}}/news').template({
            baseurl: config.webapp.app.uri.full()
        }).s , function(err, response, body){
            if (!err && response.statusCode == 200)
                return resolve(JSON.parse(body));
            else return resolve([])
        })
    })
}

function getArticle(hash){
    return new Promise(function(resolve, reject){
        request(S('{{baseurl}}/news/{{id}}').template({
            baseurl: config.webapp.app.uri.full(),
            id: hash
        }).s, function(err, response, body){
            if (!err && response.statusCode == 200)
                return resolve(JSON.parse(body));
            else return resolve([])
        })
    })
}


function simulateChoose(){
    getNews()
    .then(function(news){
        if (news.length){
            console.log("CLIENT choosing in a list of %s articles...", news.length)
            var newsidx = Math.floor(Math.random() * (news.length - 1))
            console.log("CLIENT choosing article: "+ news[newsidx].title)
            return getArticle(news[newsidx].hash)
            .then(function(article){
                console.log("CLIENT reading article...")
            })
        }
        console.log("CLIENT no news to choose. going away...")
    })
    .catch(function(err){
        console.log("CLIENT could not load news due to: %s", err)
    })
}

simulateChoose()
setInterval(simulateChoose, config.webclient.defaults.activity.interval)
