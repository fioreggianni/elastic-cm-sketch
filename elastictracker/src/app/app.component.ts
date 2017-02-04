import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
    <div class="container">
        <nav class="articles">
            <news></news>
        </nav>
        <section class="news">
        </section>
        <section class="news-stats">
        </section>
    </div>
    `,
    styleUrls: ['./app.component.css']
})

export class AppComponent {

}