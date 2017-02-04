import { BrowserModule }      from '@angular/platform-browser';
import { NgModule }           from '@angular/core';
import { FormsModule }        from '@angular/forms';
import { HttpModule }         from '@angular/http';
import { RouterModule }       from '@angular/router';

import { AppComponent }               from './app.component';
import { NewsComponent }              from './news.component';
import { NewsService }                from './news.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: 'news',
        component: NewsComponent
      },
      {
        path: '',
        redirectTo: '/news',
        pathMatch: 'full'
      }
    ])
  ],
  declarations: [
    AppComponent,
    NewsComponent
  ],
  bootstrap: [AppComponent],
  providers: [NewsService],
})
export class AppModule { }
