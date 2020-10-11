var express = require("express");
var sha1 = require("sha1");
var USER = require("../database/users");
var router = express.Router();
var jwt = require("jsonwebtoken");

//POST
router.post("/user", (req, res) => {
    var userRest = req.body;
    var params = req.body;
    if (params.password == null) {
        res.status(300).json({msn: "El password es necesario pra continuar con el registro"});
        return;
    }
    if (params.password.length < 6) {
        res.status(300).json({msn: "Es demasiado corto"});
        return;
    }
    if (!/[A-Z]+/.test(params.password)) {
        res.status(300).json({msn: "El password necesita una letra Mayuscula"});
        
        return;
    }
    if (!/[\$\^\@\&\(\)\{\}\#]+/.test(params.password)) {
        res.status(300).json({msn: "Necesita un caracter especial"});
        return;
    }
    if(params.tipo != null){
        params["tipo"] = "propietario";
        console.log("se registro propietario");
    }else{
        params["tipo"] = "cliente";
        console.log("se registro cliente");
    }
    params.password = sha1(params.password);
    var userDB = new USER(params);
    userDB.save((err, docs) => {
        if (err) {
            var errors = err.errors;
            var keys = Object.keys(errors);
            var msn = {};
            for (var i = 0; i < keys.length; i++) {
                msn[keys[i]] = errors[keys[i]].message;
            }
            res.status(500).json(msn);
            return;
        }
        res.status(200).json(docs);
        return;
    })
});
// GET Users
router.get('/user', (req, res) => {
    var params = req.query;
    var limit = 100;
    if (params.limit != null) {
        limit = parseInt(params.limit);
    } 
    var skip = 0;
    if (params.skip != null) {
        skip = parseInt(params.skip);
    }
    USER.find({}).limit(limit).skip(skip).exec((err, docs) => {
        res.status(200).json(docs);
    console.log('mostrando users');
    });
});

// DELETE User 
router.delete("/user", async(req,res) => {
    var id = req.query.id;
    console.log(req.query.id);
    if (id == null) {
      res.status(300).json({
        msn: "introducir id"    
      });
      return;
    }
    var result = await USER.remove({_id: id});
    res.status(200).json(result);
    console.log('user deleted');
  });

//LOGIN
router.post("/login", async(req, res) => {
    var body = req.body;
    if (body.nick == null) {
        res.status(300).json({msn: "El nick es necesario"});
             return;
    }
    if (body.password == null) {
        res.status(300).json({msn: "El password es necesario"});
        return;
    }
    var results = await USER.find({nick: body.nick, password: sha1(body.password)});
    if (results.length == 1) {
        res.status(200).json({msn: "Bienvenido " + body.nick + " al sistema"});
        return;
    }
    res.status(200).json({msn: "Credenciales incorrectas"});
});
module.exports = router
