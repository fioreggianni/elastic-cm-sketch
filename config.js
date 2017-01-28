var S = require("string")

function getUrl(uri){
	return S("{{protocol}}://{{host}}:{{port}}{{suffix}}").template(uri)
}
module.exports = {
	webapp: {
		app: {
			name: "Weber",
			uri: {
				protocol: "http",
				host: "127.0.0.1",
				port: 8080,
				full: function(){
					return getUrl(this)
				}
			}
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
				port: 80,
				version: "v1",
				full: function(){
					this.suffix = "/"+this.version;
					return getUrl(this)
				}
			}
		}
	},
	tracker: {
		app: {
			name: "Connor",
			uri: {
				protocol: "http",
				host: "127.0.0.1",
				port: 3000,
				full: function(){
					return getUrl(this)
				}
			}
		}
	},
	webclient: {
		app: {
			name: "Clienton"
		},
		defaults: {
			activity: {
				interval: 100 /* milliseconds */
			}
		}
	}
}