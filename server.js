'use strict'
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
 * Iniciar Servidor, y Webhooks
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
 */
wss.on('connection', ws => {
	let promises = func.getData()
	.then((values) => {
		ws.send(JSON.stringify({"values": values}))
	})
	let milsec = 10000 //1000 milsec = 1 segundo
	setInterval(() => {
		let promises = func.getData()
		.then((values) => {
			ws.send(JSON.stringify({"values": values}))
		})
	}, milsec)
})



