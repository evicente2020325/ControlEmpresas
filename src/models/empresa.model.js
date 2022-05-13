const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmpresaSchema = Schema({
    nombreEmpresa: String,
    password: String,
    empleados: [{
        nombreEmpleado : String,
        puesto : String,
        departamento : String,
    }],
    rol : String
});

module.exports = mongoose.model('Empresas', EmpresaSchema);