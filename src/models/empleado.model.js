const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const empleadoSchema = new Schema({
    nombreEmpleado : String,
    puesto : String,
    departamento : String,
})

module.exports = mongoose.model('Empleados', empleadoSchema);