'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encritacion_IN6AMDG';

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: ' La peticion no lleva cabecera de autorizacion' })
    } else {
        var token = req.headers.authorization.replace(/['"']+/g, '');

        try {
            var playload = jwt.decode(token, secretKey);
            if (playload.exp <= moment().unix()) {
                return res.status(401).send({ message: ' Token ya expirado' })
            }
        } catch (err) {
            return res.status(404).send({ message: 'Token invalido' })
        }
        req.user = playload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next) => {
    var playload = req.user;

    if (playload.tipo_rol != 'admin') {
        return res.status(404).send({ message: 'No tienes permiso para ingresar a esta ruta' })
    } else {
        return next();
    }
}


exports.ensureAuthEmpre = (req, res, next) => {
    var playload = req.user;

    if (playload.tipo_rol != 'empresa') {
        return res.status(404).send({ message: 'No tienes permiso para ingresar a esta ruta' })
    } else {
        return next();
    }
}