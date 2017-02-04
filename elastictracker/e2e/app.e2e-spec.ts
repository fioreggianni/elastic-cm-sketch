import { ElastictrackerPage } from './app.po';

describe('elastictracker App', function() {
  let page: ElastictrackerPage;

  beforeEach(() => {
    page = new ElastictrackerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
