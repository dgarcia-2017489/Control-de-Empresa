'use strict'

var Empresa = require('../models/empresa.model');
var Empleado = require('../models/empleado.model');
var jwt = require('../services/jwt')
var bcrypt = require('bcrypt-nodejs');

var ejs = require("ejs");
var pdf = require("html-pdf");
var path = require("path");

var tipo_rol;


function createadmin(req, res) {
    var usuario = new Empresa();
    Empresa.findOne({ username: 'admin' }, (err, admin) => {
        if (err) {
            console.log('No se pudo crear el usuario');
        } else if (admin) {
            console.log('El administrador se creo exitosamente');
        } else {
            bcrypt.hash('12345', null, null, (err, passwordHash) => {
                if (err) {
                    res.status(500).send({ message: 'Error en la encriptacion de la contraseña' })
                } else if (passwordHash) {
                    usuario.username = 'admin'
                    usuario.password = passwordHash
                    usuario.tipo_rol = 'admin'
                    tipo_rol = 'admin';
                    usuario.save((err, userSaved) => {
                        if (err) {
                            console.log('No se pudo crear el usuario');
                        } else if (userSaved) {
                            console.log('Se creo el administrador');
                        } else {
                            console.log('No se pudo crear el administrador');
                        }
                    })
                }
            })
        }
    })
}

function login(req, res) {
    var params = req.body;

    if (params.username && params.password) {
        Empresa.findOne({ username: params.username.toLowerCase() }, (err, userFind) => {
            if (err) {
                res.status(500).send({ message: 'Error de servidor' })
            } else if (userFind) {
                bcrypt.compare(params.password, userFind.password, (err, checkPassword) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al verificar la contraseña' });
                    } else if (checkPassword) {
                        if (params.gettoken) {
                            return res.send({ token: jwt.createToken(userFind) });
                        } else {
                            return res.send({ message: 'Usuario logeado' });
                        }
                    } else {
                        return res.status(404).send({ message: 'Contraseña incorrecta' });
                    }
                })
            } else {
                return res.send({ message: 'El usuario no se encontro' });
            }
        })
    } else {
        return res.status(401).send({ message: 'Ingresa todos los campos' });
    }
}

/*CRUD EMPRESA*/

function setEmpresa(req, res) {
    var emp = new Empresa();
    var params = req.body;

        if (params.name && params.username && params.password) {
            Empresa.findOne({ name: params.name }, (err, userFind) => {
                if (err) {
                    res.status(500).send({ message: 'Error de servidor', err })
                } else if (userFind) {
                    res.status(200).send({ message: 'Usuario ya utilizado' })
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                        if (err) {
                            res.status(500).send({ message: 'Error al encriptar la contraseña' })
                        } else if (passwordHash) {
                            emp.name = params.name
                            emp.username = params.username.toLowerCase()
                            emp.password = passwordHash
                            emp.tipo_rol = 'empresa';
                            emp.save((err, userSaved) => {
                                if (err) {
                                    res.status(500).send({ message: 'No se puedo guardar los datos' })
                                } else if (userSaved) {
                                    res.status(200).send({ message: 'Guardado Exitosamente' })
                                }
                            })
                        }
                    })
                }
            })
        } else {
            res.status(200).send({ message: 'Ingrese todos los campos' })
        }
}

function actualizarEmpresa(req, res) {
    let update = req.body;
    let Id = req.params.id;

        if (update.password) {
            res.status(500).send({ message: 'La contraseña no se puede actualizar' });
        } else {
            if (update.name && update.username) {
                Empresa.findOne({ username: update.username.toLowerCase() }, (err, usernameFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Erro en el servidor' });
                    } else if (usernameFind) {
                        res.status(200).send({ message: 'Usuario no existente' });
                    } else {
                        Empresa.findByIdAndUpdate(Id, update, { new: true }, (err, userUpdated) => {
                            if (err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            } else if (userUpdated) {
                                res.status(200).send({ message: 'Usuario actualizado correctamente', userUpdated });
                            } else {
                                res.status(200).send({ message: 'No hay registros que se puedan actualizar' });
                            }
                        });
                    }
                })
            } else {
                res.status(200).send({ message: 'Ingrese todos los campos' })
            }
        }
}

function removeEmpresa(req, res) {
    let Id = req.params.id;


        Empresa.findByIdAndRemove(Id, (err, userRemoved) => {
            if (err) {
                res.status(500).send({ message: 'Error de servicio' });
            } else if (userRemoved) {
                res.status(200).send({ message: 'Empresa Eliminada correctamente', userRemoved });
            } else {
                res.status(200).send({ message: 'Usuario no existente' });
            }
        })
}

/*CRUD EMPLEADO*/ 

function setEmpleado (req, res) {
    let empreId = req.params.id;
    let params = req.body;
    let emp = new Empleado();

    if (empreId != req.user.sub) {
        return res.status(500).send({ message: 'Solo puedes agregar empleados de tu propia empresa' });
    } else {
        Empresa.findById(empreId, (err, empleadoFind) => {
            if (err) {
                res.status(500).send({ message: 'Error en el servidor' });
            } else if (empleadoFind) {
                if (params.name && params.puesto && params.departamento) {
                    emp.name = params.name;
                    emp.puesto = params.puesto.toLowerCase();
                    emp.departamento = params.departamento.toLowerCase();
                    Empresa.findByIdAndUpdate(empreId, { $push: { empleado: emp }, $inc: { cantEmple: +1 } }, { new: true }, (err, empleadoUpdated) => {
                        if (err) {
                            res.status(500).send({ message: 'Error general' });
                        } else if (empleadoUpdated) {
                            res.status(200).send({ message: 'Empleado agregado exitosamente', empleadoUpdated })
                        } else {
                            res.status(404).send({ message: 'Erro al agregar el empleado' });
                        }
                    })
                } else {
                    res.status(200).send({ message: 'Ingresa todos los campos' })
                }
            } else {
                res.status(200).send({ message: 'El Id de la empresa no existe' });
            }
        })
    }
}

function actualizarEmpleado(req, res) {
    var empresaId = req.params.idEmpre;
    var empleado = req.params.idEmple;
    var update = req.body;

    if (empresaId == req.user.sub) {
        if (update.name && update.puesto && update.departamento) {
            Empresa.findOne({ _id: empresaId }, (err, userFind) => {
                if (err) {
                    res.status(500).send({ message: 'Error general' });
                } else if (userFind) {
                    Empresa.findOneAndUpdate({ _id: empresaId, 'empleado._id': empleado },
                        {
                            'empleado.$.name': update.name,
                            'empleado.$.puesto': update.puesto.toLowerCase(),
                            'empleado.$.departamento': update.departamento.toLowerCase(),
                        }, { new: true }, (err, userUpdated) => {
                            if (err) {
                                res.status(500).send({ message: 'Error general al acrualizar el documento embedido' });
                            } else if (userUpdated) {
                                res.status(200).send({ message: 'Empleado actualizado ', userUpdated });
                            } else {
                                res.status(404).send({ message: 'El empleado no se actualizo' });
                            }
                        })
                } else {
                    res.status(200).send({ message: 'Registro inixistente' });
                }
            })
        } else {
            res.status(200).send({ message: 'Ingresa todos los datos' });
        }
    } else {
        res.send({ message: 'Solo puede actualizar empleados de tu propia empresa' });
    }    
}

function removeEmpleado(req, res) {
    var empresaId = req.params.idEmpre;
    var empleadoId = req.params.idEmple;

    if (empresaId == req.user.sub) {
        Empresa.findOneAndUpdate({ _id: empresaId, 'empleado._id': empleadoId }, 
        { $pull: { empleado: { _id: empleadoId } } }, { new: true }, (err, empleadoRemove) => {
            if (err) {
                res.status(500).send({ message: 'Error general' });
            } else if (empleadoRemove) {
                Empresa.findByIdAndUpdate(empresaId, { $inc: { cantEmple: -1 } }, { new: true }, (err, empleadoRemove) => {
                    if (err) {
                        res.status(500).send({ message: 'Error general' });
                    } else if (empleadoRemove) {
                        res.status(200).send({ message: 'Empleado Eliminado exitosamente: ', empleadoRemove });
                    }
                })
            }else {
                res.status(200).send({ message: 'Empleado no existente' });
            }
        })
    } else {
        res.send({ message: 'Solo puedes eliminar empleados de tu propia empresa' })
    }
}

function buscarEmpleado(req, res) {
    let idEmpresa = req.params.idEmpre;
    let idEmpleado = req.params.idEmple;

    if (idEmpresa == req.user.sub) {
        Empresa.findOne({ _id: idEmpresa }, { empleado: { $elemMatch: { _id: idEmpleado } } }).exec((err, empleado) => {
            if (err) {
                res.status(500).send({ message: 'Error general de servidor' });
            } else if (empleado) {
                res.send({ message: 'Empleado:', empleados: empleado.empleado })
            } else {
                res.status(404).send({ message: 'No existen empleados' });
            }
        })
    } else {
        res.send({ message: 'Solo puedes buscar empleados de tu propia empresa' });
    }
}

function searchEmpleado(req, res) {
    Empresa.aggregate([
        { $match: { 'username': req.user.username } },
        { $unwind: '$empleado' },
        {
            $match: {
                $or: [{ 'empleado.name': req.body.search },
                { 'empleado.puesto': req.body.search.toLowerCase() },
                { 'empleado.departamento': req.body.search.toLowerCase() }]
            }
        },
        {
            "$group": {
                _id: req.user.sub,
                empleado: { "$push": "$empleado" }
            }
        }
    ]).exec((err, empleados) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else if (empleados) {
            res.status(200).send({ Result: empleados })
        } else {
            res.status(404).send({ message: 'No existen registros' });
        }
    })
}

/*MOSTRAR PDF*/ 

function mostrarPDF(req, res) {
    var empresaId = req.params.id;
    Empresa.findOne({ _id: empresaId }).exec((err, empleados) => {
        if (err) {
            res.status(500).send({ message: 'Error general de servidor' });
        } else if (empleados) {
            ejs.renderFile(path.join('./view', "pdf.ejs"), { params: empleados.empleado }, (err, data) => {
                if (err) {
                    res.send(err);
                } else {
                    let options = {
                        "height": "12in",
                        "width": "9in",
                        "header": {
                            "height": "25mm"
                        },
                        "footer": {
                            "height": "25mm",
                        },
                    };

                    pdf.create(data, options).toFile("reporte.pdf", function (err, data) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send("PDF creado exitosamente");
                            console.log('PDF creado exitosamente');
                        }
                    });
                }
            });
        } else {
            res.status(404).send({ message: 'Empleados no agregados' });
        }
    })
}


module.exports = {
    createadmin,
    login,
    setEmpresa,
    removeEmpresa,
    actualizarEmpresa,
    setEmpleado,
    actualizarEmpleado,
    removeEmpleado,
    mostrarPDF,
    buscarEmpleado,
    searchEmpleado
}