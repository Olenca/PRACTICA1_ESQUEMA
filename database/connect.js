var mongoose = require("mongoose");
mongoose.connect("mongodb://172.23.0.2:27017/Userdatabase", {useNewUrlParser: true});
var db  = mongoose.connection;
db.on("error", () => {
    console.log("ERROR no se puede conectar al servidor");
});
db.on("open", () => {
    console.log("Conexion exitosa");
});

module.exports = mongoose;
