"use strict"
const dotenv = require('dotenv');
dotenv.config();
console.log("env readed");
const env = module.exports = {
	"forecast": {
		"secretkey": process.env.FORECAST_APIKEY,
		"url": "https://api.darksky.net/forecast/"
	},
	"redis": {
		"url":  process.env.REDIS_URL,
	},
	"config": {
		"serverport" : process.env.SERVER_PORT,
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
