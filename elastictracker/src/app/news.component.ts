import { Component, OnInit } from '@angular/core';
import { Article } from './article';
import { NewsService } from './news.service';

@Component({
  selector: 'news',
  template: `
    <div class='articles-list'>
        <div class="article-preview"
            *ngFor="let article of articles; let odd=odd; let even=even;"
            [ngClass]="{ odd: odd, even: even }"
            [style.height]="100/articles.length+'%'"
            >
                <div class="article-stat">
                    {{article.stats.hits}}<br>visits
                </div>
                <div class="article-icon">
                </div>
                <div class="article-title">
                    {{article.title}}
                </div>
        </div>
    </div>
  `,
  styleUrls: [`./news.component.css`]
})

export class NewsComponent implements OnInit {
  constructor(private newsService: NewsService) { 

  };

  ngOnInit(): void {
    this.getArticles();
  };
  articles: Article[];
  getArticles(): void {
    this.newsService.getNews().then(articles => this.articles = articles);
    var self = this;
    setInterval(function(){
      self.newsService.getNews().then(articles => {
        if (articles && articles.length) self.articles = articles;
      })
    }, 1000)
  };
}
