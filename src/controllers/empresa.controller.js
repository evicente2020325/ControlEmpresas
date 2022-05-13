const Empresa = require('../models/empresa.model');
const Empleado = require('../models/empleado.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const mongoose = require('mongoose');

function agregarEmpresa(req, res) {
    var parametros = req.body;
    var EmpresaModel = new Empresa();

    if(req.user.rol == 'ADMINISTRADOR'){
        if(parametros.nombreEmpresa && parametros.password) {
            EmpresaModel.nombreEmpresa = parametros.nombreEmpresa;
                Empresa.find({ nombreEmpresa : parametros.nombreEmpresa }, (err, EmpresaEncontrada) => {

                    EmpresaModel.rol = 'EMPRESA';

                    if ( EmpresaEncontrada.length == 0 ) {
    
                        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                            EmpresaModel.password = passwordEncriptada;
    
                            EmpresaModel.save((err, EmpresaGuardada) => {
                                if (err) return res.status(500)
                                    .send({ mensaje: 'Error en la peticion' });
                                if(!EmpresaGuardada) return res.status(500)
                                    .send({ mensaje: 'Error al agregar la empresa'});
                                
                                return res.status(200).send({ empresa: EmpresaGuardada });
                            });
                        });                    
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Este nombre ya se encuentra utilizado' });
                    }
                })
        }
    }else{
        return res.status(500).send({mensaje: 'Tiene que ser administrador para agregar empresas.'})
    }
    
}

function editarEmpresa(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var parametros = req.body;

    if(req.user.rol == 'ADMINISTRADOR'){
        Empresa.findByIdAndUpdate(idEmpresa, parametros, { new : true } ,(err, EmpresaEditada)=>{
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if(!EmpresaEditada) return res.status(404)
                .send({ mensaje: 'Error al Editar la empresa' });
    
            return res.status(200).send({ empresa: EmpresaEditada});
        })
    }else{
        return res.status(404).send({mensaje: 'Tiene que ser administrador para editar empresas.'})
    }
    
}

function EliminarEmpresa(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if(req.user.rol == 'ADMINISTRADOR'){
        Empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminada)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if(!empresaEliminada) return res.status(500)
                .send({ mensaje: 'Error al eliminar la empresa' })
    
            return res.status(200).send({ empresa: empresaEliminada });
        })
    }else{
        return res.status(500).send({ mensaje: 'Tiene que ser administrador para eliminar empresas.'})
    }   
}


function loginEmpresa(req, res) {
    var parametros = req.body;
    Empresa.findOne({ nombreEmpresa : parametros.nombreEmpresa }, (err, empresaEncontrada) => {
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if (empresaEncontrada){
            bcrypt.compare(parametros.password, empresaEncontrada.password, 
                (err, verificacionPassword) => {
                    if (verificacionPassword) {
                        return res.status(200)
                            .send({ token: jwt.crearToken(empresaEncontrada)})
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'La contrasena no coincide.'})
                    }
                })
        }
    })
}

function agregarEmpleado(req, res) {
    const parametros = req.body;

    if(req.user.rol == 'EMPRESA'){
        if(parametros.nombreEmpleado && parametros.puesto && parametros.departamento){

            Empresa.findByIdAndUpdate(req.user.sub, {$push:{empleados: {nombreEmpleado: parametros.nombreEmpleado, puesto: parametros.puesto, departamento: parametros.departamento}}},{new : true},
            (err, empleadoActualizado)=>{
                return res.status(200).send({empleado : empleadoActualizado})
            })
        
    
        } else {
            return res.status(404).send({ mensaje: 'Debe enviar los parametros Obligatorios'});
        }
    
    }else{
        return res.status(404).send({ mensaje: 'No tienes permiso para agregar empleados.'})
    }
}

function agregarEmpleadoEmpresa(req, res) {
    var empresaId = req.params.idEmpresa;
    var empleadoId = req.params.idEmpleado;

    if(req.user.rol == 'EMPRESA'){
        Empresa.findByIdAndUpdate(empresaId, { $push: {  empleados : { idEmpleado: empleadoId } } }, {new : true}, 
            (err, empleadoAgregado) => {
                if(err) return res.status(500).send({ mensaje: 'Error en  la peticion'});
                if(!empleadoAgregado) return res.status(500).send({ mensaje: 'Error al agregar el empleado a la empresa'});
    
                return res.status(200).send({ empleados: empleadoAgregado });
            })
    }else{
        return res.status(500).send({mensaje: 'No tienes permiso para agregar empleados.'})
    }
}

function editarEmpleadoEmpresa(req, res) {
    const empleadoId = req.params.idEmpleado;
    const parametros = req.body;

    if(req.user.rol == 'EMPRESA'){
        Empresa.findOneAndUpdate({ empleados: { $elemMatch: {_id: empleadoId}}},
            {"empleados.$.nombreEmpleado": parametros.nombreEmpleado, "empleados.$.puesto": parametros.puesto, "empleados.$.departamento": parametros.departamento}, {new : true}, (err, empleadoActualizado) => {
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!empleadoActualizado) return res.status(500).send({mensaje: 'error al editar el empleado'});

        return res.status(200).send({empleado: empleadoActualizado}) 
    })
    }else{
        return res.status(500).send({mensaje: 'no tienes permisos para editar el empleado.'})
    }
    
}

function EliminarEmpleado(req, res) {
    var idEmpleado = req.params.idEmpleado;

    if(req.user.rol == 'EMPRESA'){
        Empresa.findOneAndUpdate({ empleados : { $elemMatch : { _id: idEmpleado } } }, 
            { $pull : { empleados : { _id : idEmpleado } } }, {new : true}, (err, empleadoEliminado)=>{
                if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                if(!empleadoEliminado) return res.status(500).send({ mensaje: 'Error al eliminar el empleado'});
    
                return res.status(200).send({empleado : empleadoEliminado})
            })
    }else{
        return res.status(500).send({mensaje: 'No tienes permisos para elimar el empleado.'})
    }
}

function ObtenerEmpresa (req, res) {
    Empresa.find({}, (err, empresasEncontradas) => {
        return res.send({ empresas : empresasEncontradas })
    }).populate('empleados.idEmpleado');
}   

function BusquedaNombre(req, res) {
    var empresaId = req.user.sub;
    var parametros = req.body;

    Empresa.aggregate([
        {
            $match: { "_id": mongoose.Types.ObjectId(empresaId) }
        },
        {
            $unwind: "$empleados"
        },
        {
            $match: { "empleados.nombreEmpleado": { $regex: parametros.nombreEmpleado, $options: 'i' } }
        }, 
        {
            $group: {
                "_id": "$_id",
                "nombreEmpleado": { "$first": "$nombreEmpleado" },
                "empleados": { $push: "$empleados" }
            }
        }
    ]).exec((err, empleadosEncontrados) => {
        return res.status(200).send({ empleado: empleadosEncontrados })
    })
}

function BusquedaPuesto(req, res) {
    var empresaId = req.user.sub;
    var parametros = req.body;

    Empresa.aggregate([
        {
            $match: { "_id": mongoose.Types.ObjectId(empresaId) }
        },
        {
            $unwind: "$empleados"
        },
        {
            $match: { "empleados.puesto": { $regex: parametros.puesto, $options: 'i' } }
        }, 
        {
            $group: {
                "_id": "$_id",
                "puesto": { "$first": "$puesto" },
                "empleados": { $push: "$empleados" }
            }
        }
    ]).exec((err, empleadosEncontrados) => {
        return res.status(200).send({ empleado: empleadosEncontrados })
    })
}
function BusquedaDepartamento(req, res) {
    var empresaId = req.user.sub;
    var parametros = req.body;

    Empresa.aggregate([
        {
            $match: { "_id": mongoose.Types.ObjectId(empresaId) }
        },
        {
            $unwind: "$empleados"
        },
        {
            $match: { "empleados.departamento": { $regex: parametros.departamento, $options: 'i' } }
        }, 
        {
            $group: {
                "_id": "$_id",
                "departamento": { "$first": "$departamento" },
                "empleados": { $push: "$empleados" }
            }
        }
    ]).exec((err, empleadosEncontrados) => {
        return res.status(200).send({ empleado: empleadosEncontrados })
    })
}

function BusquedaTodosLosEmpleados(req, res) {
    var empresaId = req.user.sub;
    var parametros = req.body;

    Empresa.aggregate([
        {
            $match: { "_id": mongoose.Types.ObjectId(empresaId) }
        },
        {
            $unwind: "$empleados"
        },
        {
            $match: {}
        }, 
        {
            $group: {
                "_id": "$_id",
                "departamento": { "$first": "$departamento" },
                "empleados": { $push: "$empleados" }
            }
        }
    ]).exec((err, empleadosEncontrados) => {
        return res.status(200).send({ empleado: empleadosEncontrados })
    })
}

module.exports = {
    agregarEmpresa,
    editarEmpresa,
    loginEmpresa,
    EliminarEmpresa,
    agregarEmpleado,
    agregarEmpleadoEmpresa,
    editarEmpleadoEmpresa,
    ObtenerEmpresa,
    BusquedaNombre,
    EliminarEmpleado,
    BusquedaDepartamento,
    BusquedaPuesto,
    BusquedaTodosLosEmpleados
}
