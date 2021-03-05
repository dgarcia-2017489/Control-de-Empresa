'use strict'

const express = require('express');
const usuarioController = require('../controllers/usuario.controller');
const mdAuth = require('../middlewares/authenticated');
const api = express.Router();

/* Rutas de empresas */
api.post('/login', usuarioController.login);
api.post('/setEmpresa', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], usuarioController.setEmpresa);
api.put('/actualizarEmpresa/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], usuarioController.actualizarEmpresa);
api.delete('/removeEmpresa/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], usuarioController.removeEmpresa);

/* Rutas de empleados */
api.put('/setEmpleado/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpre], usuarioController.setEmpleado);
api.put('/:idEmpre/actualizarEmpleado/:idEmple', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpre], usuarioController.actualizarEmpleado);
api.put('/:idEmpre/removeEmpleado/:idEmple', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpre], usuarioController.removeEmpleado);
api.get('/:idEmpre/buscarEmpleado/:idEmple', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpre], usuarioController.buscarEmpleado);
api.put('/searchEmpleado', [mdAuth.ensureAuth, mdAuth.ensureAuthEmpre], usuarioController.searchEmpleado);

/* Rutas para mostrar pdf */
api.get('/mostrarPDF/:id', usuarioController.mostrarPDF);


module.exports = api;