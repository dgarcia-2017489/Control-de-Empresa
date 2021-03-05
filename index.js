'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3200;
var rutaAdmin = require('./controllers/usuario.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/ControlEmpresa', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado a la BD');
        rutaAdmin.createadmin();
        app.listen(port, () => {
            console.log('Servidor de express corriendo');
        })
    })
    .catch((err) => {
        console.log('Error al conectarse a la BD', err);
    })