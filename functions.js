"use strict"
const request = require('request')
module.exports = function (redisClient, env) {
	/**
	 * Variables de las funciones
	 */
	this.redisClient = redisClient
	this.env = env
	const that = this

	/**
	 * Envía a Redis las variables de latitud y longitud definidas en
	 * la configuración incial
	 *
	 * @param {redisClient} Cliente de Redis configurado
	 */
	this.setRedis = () => {
		console.log("Setting redis")
		that.env.cities.forEach((city) => {
			that.redisClient.set(city.name+'-lat', city.lat)
			that.redisClient.set(city.name+'-long', city.long)
		})
	}

	/**
	 * Obtiene las coordenadas de una ciudad, desde el servidor de Redis 
	 * configurado en la plataforma
	 *
	 * @param {name} Nombre de la ciudad, la cual se utiliza como key
	 * @returns {Array} Retorna las coordenadas de la forma [latitud, longitud]
	 */
	this.getCity = async (name) => {
		let promise = new Promise((res, rej) => {
			var mult = that.redisClient.multi()
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
	this.APICall = async (city) => {
		try {
			if (Math.random(0, 1) < 0.1) {
				throw new Error('How unfortunate! The API Request Failed') 
			}
			let url = that.env.forecast.url+that.env.forecast.secretkey+
				"/"+city[0]+","+city[1]+"?units=si"
			let promise = new Promise((res, rej) => {
				request(url, {json: true}, (err, response, body) => {
					return res(body)
				})
			})
			return await promise
		}
		catch (error){
			let timestamp = Date.now()
			that.redisClient.hset("api.errors", timestamp, 'Error de fallo 10%')
			return await that.APICall(city)
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
	this.getData = () => {
		var promises = []
		that.env.cities.forEach((city) => {
			let promise = new Promise((res, rej) => {
				that.getCity(city.name)
					.then((citycoord) => that.APICall(citycoord)
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
}
