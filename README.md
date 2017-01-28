# elastic-cm-sketch
Count-Min Sketch with elastic accuracy (experimental)

`npm run tracker`

Simulates a Web tracking server.
<br>Will track in real-time top referrers for each delivered news using Elastic-CountMin-Sketch algorithm. 

`npm run webapp`

Simulates a Web API serving news.
For each delivered news article, will communicate referer to the tracker.