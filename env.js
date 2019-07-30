const env = module.exports = {
	"forecast": {
		"secretkey": "9048f1bb3e7f848c0acc3d39d60409ed",
		"url": "https://api.darksky.net/forecast/"
	},
	"redis": {
		"host": "localhost",
		"port": "6379"
	}.
	"config": {
		"serverport" : 8000,
		"websocketport" : 8080,
	},
	"cities": [
		{"name": "Santiago", "iso": "CL", "lat": -33.4569400, "long": -70.64827},
		{"name": "Zurich", "iso": "CH", "lat": 47.36667, "long":  8.550000},
		{"name": "Auckland", "iso": "NZ", "lat": -36.86667, "long": 174.76667},
		{"name": "Sydney", "iso": "AU", "lat": -33.867850 , "long": 151.20732 },
		{"name": "Londres", "iso": "UK", "lat": 51.508530 , "long": -0.125740},
		{"name": "Georgia", "iso": "USA", "lat": 40.187330, "long": -74.28459},
	]
}
