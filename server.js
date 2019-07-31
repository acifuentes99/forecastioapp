"use strict"
const basedir = __dirname
const http = require('http')
const fs = require('fs')
const WebSocket = require('ws')
const app = require(basedir+'/app.js')
const env = require(basedir+'/env.js')
const functions = require(basedir+'/functions.js')
const port = process.env.PORT || env.config.serverport
const redisClient = require("redis")
.createClient(env.redis.url, { no_ready_check: true })

redisClient
.on('ready',() => console.log("Redis is ready"))
.on('error',() => console.log("Error in Redis"))

const func = new functions(redisClient, env)

/**
 * Iniciar Servidor y Webhook 
 */
var server = http.createServer(app)
func.setRedis(redisClient)
server.listen(port)
console.log(`server is listening on ${port}`)

const wss = new WebSocket.Server({ server: server })
console.log("Websocket created")


/**
 * Websocket funcionando cada 10 segundos (variable milsec), realizando
 * llamadas a la API a través de funcionalidad implementada
 * Se utiliza la funcionalidad de "Ping-Pong", donde es necesario que el
 * servidor reciba un "Pong", para poder realizar la consulta a la API
 * (Esto, para no superar la capacidad de las llamadas de API)
 */
wss.on('connection', ws => {
	ws.on('pong', (msg) => {
		console.log("Asking API")
		ws.isAlive = true
		let promises = func.getData()
		.then((values) => {
			ws.send(JSON.stringify({"values": values}))
		})
	})
	ws.ping()
	ws.isAlive = false
	let milsec = 10000 //10000 milsec = 10 segundos
	let interval = setInterval(() => {
		if (ws.isAlive === false){
			clearInterval(interval)
			ws.terminate()
			console.log("socket killed")
		}
		ws.ping()
		ws.isAlive = false
	}, milsec)
})

