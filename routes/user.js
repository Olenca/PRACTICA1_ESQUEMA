var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var fileupload = require('express-fileupload')
var jwt = require("jsonwebtoken");

var User  = require("../database/users");

router.use(fileupload({
    fileSize: 50 * 1024 * 1024
}));

/*
Login USER
*/
router.post("/login", async(req, res) => {
    var body = req.body;
    if (body.email == null) {
        res.status(300).json({msn: "El email es necesario"});
             return;
    }
    if (body.password == null) {
        res.status(300).json({msn: "El password es necesario"});
        return;
    }
    var results = await User.find({email: body.email, password: body.password});
    if (results.length == 1) {
        var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60*60),
            data: results[0].id
        },'Practica1');

        res.status(200).json({msn: "Bienvenido " + body.email + " al sistema", token: token});
        return;
    }
    res.status(200).json({msn: "Credenciales incorrectas"});
});
//token
var  midleware = (req, res, next) => { 
 var token = req.headers["authorization"];
 if(token == null){
     res.status(403).json({error:" no tienes acceso a este lugar token, token null "});
     return;
  } 
  try{
      var decoded = jwt.verify(token, 'Practica1');
      if(Date.now() / 1000 > decoded.exp ){
        res.status(403).json({error:"el tiempo del  token ya expiro"});
        return;
      }
      if(decoded == null) {
         res.status(403).json({error:"no tienes acceso al token "});
         return;
      } else {
             next();
             return;
      }
     
  } catch (TokenExpiredError) {
         res.status(403).json({error:"El token ya expiro"});
        return;
  } 

}
//POST
router.post("/user",  (req, res) => {
  var Foto = req.files.foto;
  console.log(req.files.foto);
  var path = __dirname.replace(/\/routes/g, "/Imagenes");
  var date = new Date();
  var sing  = sha1(date.toString()).substr(1, 5);
  var totalpath = path + "/" + sing + "_" + Foto.name.replace(/\s/g,"_");
  Foto.mv(totalpath, async(err) => {
        if (err) {
            return res.status(500).send({msn : "Error al escribir el archivo en el disco duro"});
        }
  });
  var datos = req.body;
  var obj = {};
  obj["foto"] = totalpath;
  obj["hash"] = sha1(totalpath);
  obj["relativepath"] = "/api/1.0/foto/?id=" + obj["hash"];
  obj["nombre"] = datos.nombre;
  obj["email"] = datos.email;
  obj["password"] = datos.password;
  var user = new User(obj);
  user.save((err, docs) => {
    if (err) {
         res.status(500).json({msn: "ERROR "})
           return;
    }
    res.status(200).json({msn: "User Registrado"}); 
  });
});
//GET
router.get("/user", midleware, (req, res) => {
  var skip = 0;
  var limit = 10;
  if (req.query.skip != null) {
    skip = req.query.skip;
  }

  if (req.query.limit != null) {
    limit = req.query.limit;
  }
  User.find({}).skip(skip).limit(limit).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn" : "Error en la db"
      });
      return;
    }
    res.json({
      result : docs
    });
  });
});
router.get("/foto", async(req, res, next) => {
    var params = req.query;
    if (params == null) {
        res.status(300).json({ msn: "Error es necesario un ID"});
        return;
    }
    var id = params.id;
    var user =  await User.find({hash: id});
    if (user.length > 0) {
        var path = user[0].foto;
        res.sendFile(path);
        return;
    }
    res.status(300).json({
        msn: "Error en la petición"
    });
    return;
});

//PUT
router.put("/user",  midleware, async(req, res) => {
    var params = req.query;
    var bodydata = req.body;
    if (params.id == null) {
        res.status(300).json({msn: "El parámetro ID es necesario"});
        return;
    }
    var allowkeylist = ["nombre", "email","password"];
    var keys = Object.keys(bodydata);
    var updateobjectdata = {};
    for (var i = 0; i < keys.length; i++) {
        if (allowkeylist.indexOf(keys[i]) > -1) {
            updateobjectdata[keys[i]] = bodydata[keys[i]];
        }
    }
    User.update({_id:  params.id}, {$set: updateobjectdata}, (err, docs) => {
       if (err) {
           res.status(500).json({msn: "Existen problemas en la base de datos"});
            return;
        } 
        res.status(200).json(docs);
        return;
    });

});
// DELETE User 
router.delete("/user", midleware, async(req,res) => {
    var id = req.query.id;
    console.log(req.query.id);
    if (id == null) {
      res.status(300).json({
        msn: "introducir id"    
      });
      return;
    }
    var result = await User.remove({_id: id});
    res.status(200).json(result);
    console.log('user deleted');
  });
module.exports = router;
