const express = require('express');
const empresaControlador = require('../controllers/empresa.controller');
const md_autenticacion = require('../middlewares/autenticacion');


const api = express.Router();

api.post('/agregarEmpresa',md_autenticacion.Auth, empresaControlador.agregarEmpresa);
api.put('/editarEmpresa/:idEmpresa',md_autenticacion.Auth, empresaControlador.editarEmpresa);
api.post('/loginEmpresa', empresaControlador.loginEmpresa);
api.delete('/eliminarEmpresa/:idEmpresa',md_autenticacion.Auth, empresaControlador.EliminarEmpresa);
api.put('/agregarEmpleado',md_autenticacion.Auth, empresaControlador.agregarEmpleado);
api.put('/agregarEmpleadoAEmpresa/:idEmpresa/:idEmpleado',md_autenticacion.Auth, empresaControlador.agregarEmpleadoEmpresa)
api.put('/editarEmpleadoEmpresa/:idEmpleado',md_autenticacion.Auth, empresaControlador.editarEmpleadoEmpresa );
api.put('/eliminarEmpleado/:idEmpleado',md_autenticacion.Auth, empresaControlador.EliminarEmpleado);
api.get('/empresas', empresaControlador.ObtenerEmpresa);
api.get('/busquedaNombre',md_autenticacion.Auth, empresaControlador.BusquedaNombre);
api.get('/busquedaPuesto',md_autenticacion.Auth, empresaControlador.BusquedaPuesto);
api.get('/busquedaDepartamento',md_autenticacion.Auth, empresaControlador.BusquedaDepartamento);
api.get('/busquedaTodosLosEmpleados',md_autenticacion.Auth, empresaControlador.BusquedaTodosLosEmpleados);


module.exports = api;