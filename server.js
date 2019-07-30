'use strict'
/* Definir Variables */
const basedir = __dirname
const http = require('http')
const fs = require('fs')
const request = require('request')
const WebSocket = require('ws')
const app = require(basedir+'/app.js')
const env = require(basedir+'/env.js')
const port = process.env.PORT || env.config.serverport
/* Definir Servidor WebSockets*/
const redis_url = env.redis.url.split(/(redis:\/\/)|[:@]/g)
const redisClient = require("redis")
//.createClient({ host: env.redis.host, port: env.redis.port })
	.createClient(env.redis.url, {
		no_ready_check: true
	})
const wss = new WebSocket.Server({ port: env.config.websocketport })

redisClient
.on('ready',() => console.log("Redis is ready"))
.on('error',() => console.log("Error in Redis"))


/**
 * Envía a Redis las variables de latitud y longitud definidas en
 * la configuración incial
 *
 * @param {redisClient} Cliente de Redis configurado
 */
function setRedis (redisClient) {
	env.cities.forEach((city) => {
		redisClient.set(city.name+'-lat', city.lat)
		redisClient.set(city.name+'-long', city.long)
	})
}

/**
 * Obtiene las coordenadas de una ciudad, desde el servidor de Redis 
 * configurado en la plataforma
 *
 * @param {name} Nombre de la ciudad, la cual se utiliza como key
 * @returns {Array} Retorna las coordenadas de la forma [latitud, longitud]
 */
async function getCity(name){
	let promise = new Promise((res, rej) => {
		var mult = redisClient.multi()
		mult.get(name+"-lat")
		mult.get(name+"-long")
		mult.exec((err, data) => {
			return res(data)
		})
	})
	return await promise
}

/**
 * Realiza un llamado a la API de forecast.io, incluyendo también una simulación
 * de un error de un 10% al momento de hacer una consulta.
 * De ocurrir esto, se registra en Redis el error, y se reintenta realizar la llamada
 * a la API invocando nuevamente esta función
 *
 * @param {city} Array de las coordenadas enviadas
 * @returns {Object} Retorna la información entregada por la API de forecast
 */
async function APICall(city) {
	try {
		if (Math.random(0, 1) < 0.1) {
			throw new Error('How unfortunate! The API Request Failed') 
		}
		let url = env.forecast.url+env.forecast.secretkey+"/"+city[0]+","+city[1]+"?units=si"
		let promise = new Promise((res, rej) => {
			request(url, {json: true}, (err, response, body) => {
				return res(body)
			})
		})
		return await promise
	}
	catch (error){
		let timestamp = new Date()
		redisClient.hset("api.errors", timestamp, 'Error de fallo 10%')
		return APICall(city)
	}
}


/**
 * Función que encapsula el procedimiento de realizar llamadas a la API
 * de Forecast, para todas las ciudades registradas en la plataforma.
 * Primero, obtiene las coordenadas de una ciudad con el método getCity.
 * Posteriormente, estas coordenadas son utilizadas para realizar un llamado
 * a la API de forecast.
 * Finalmente, se retorna un arreglo con las promesas, para poder ser utilizado
 *
 * returns {Array} - Arreglo de Promesas de las llamadas de API de ciudad
 */
function getData () {
	var promises = []
	env.cities.forEach((city) => {
		let promise = new Promise((res, rej) => {
			getCity(city.name)
				.then((citycoord) => APICall(citycoord)
					.then((data) => {
						let temp = data.currently.temperature
						let time = new Date(data.currently.time*1000).toLocaleTimeString("en-US", {timeZone: data.timezone})
						let dict = {
							city: city.name,
							iso: city.iso,
							temp: temp,
							time: time,
							flags: data.flags.units
						}
						res(dict)
					})
				)})
		promises.push(promise)
	})
	return Promise.all(promises)
}

/* Websocket */
wss.on('connection', ws => {
	let promises = getData()
	.then((values) => {
		console.log(values)
		ws.send(JSON.stringify({"values": values}))
	})
	let milsec = 10000 //1000 milsec = 1 segundo
	setInterval(() => {
		let promises = getData()
		.then((values) => {
			console.log(values)
			ws.send(JSON.stringify({"values": values}))
		})
	}, milsec)
})


/* Iniciar Servidor */
app.listen(port, () => {
	setRedis(redisClient)
	console.log(`server is listening on ${port}`)
})

