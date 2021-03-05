'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encritacion_IN6AMDG';

exports.createToken = (user) => {
    var playload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        lastname: user.lastname,
        tipo_rol: user.tipo_rol,
        iat: moment().unix(),
        exp: moment().add(3, 'hours').unix()
    }
    return jwt.encode(playload, secretKey);
}