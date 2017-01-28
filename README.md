# elastic-cm-sketch
Count-Min Sketch with elastic accuracy (experimental)

`npm run tracker`

Simulates a Web tracking server.
<br>Will track in real-time top referrers for each delivered news using Elastic-CountMin-Sketch algorithm. 

`npm run webapp`

Simulates a Web API serving news.
<br>For each delivered news article, will communicate referer to the tracker.

`npm run webclient`

Simulates a Web client asking for available news and choosing random articles.
<br>Web client will continuously pull the webapp for news.
