var S = require("string")
module.exports = {
	webapp: {
		app: {
			name: "Weber"
		},
		defaults: {
			news: {
				source: "google-news",
				ttl: 600
			}
		},
		newsapi: {
			apikey: "4bb08cab119b4bba8d965404a1b99e40",
			sources: ["google-news"],
			url: {
				protocol: "http",
				host: "newsapi.org",
				version: "v1",
				full: function(){
					return S("{{protocol}}://{{host}}/{{version}}").template(this)
				}
			}
		}
	}
}