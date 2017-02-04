import { Injectable } from '@angular/core';
import { Article } from './article';
var config = require('../../../config.js')
var request = require('request')
var S = require('string')

@Injectable()
export class NewsService {
    getNews(): Promise<Article[]> {
        return new Promise(function(resolve, reject){
            request(S('{{baseurl}}/news').template({
                baseurl: config.webapp.app.uri.full()
            }).s , function(err, response, body){
                if (!err && response.statusCode == 200)
                    return resolve(JSON.parse(body))
                else return resolve([{ hash: "test", title: "Test news: "+err+"."+S('{{baseurl}}/news').template({baseurl: config.webapp.app.uri.full()}).s}])
            })
        })
    };
    getArticle(hash: string): Promise<Article> {
        return this.getNews()
            .then(articles => articles.find(article => article.hash == hash));
    }
}