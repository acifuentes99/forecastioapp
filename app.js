"use strict"
const express = require('express')
const basedir = __dirname
const app = module.exports = express()

/* Rutas de Express.JS*/
app.get('/', (req, res) => res.sendFile(basedir+'/index.html'))

