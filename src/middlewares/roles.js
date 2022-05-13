exports.Admin = function(req, res, next) {
    if(req.user.rol !== "ADMINISTRADOR") return res.status(403).send({mensaje: "Solo puede acceder el Administrador"})
    
    next();
}

exports.Empresa = function(req, res, next) {
    if(req.user.rol !== "EMPRESA") return res.status(403).send({mensaje: "Solo puede acceder la empresa"})
    
    next();
}