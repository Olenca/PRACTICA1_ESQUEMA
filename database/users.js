var mongoose = require("./connect");
var USERSCHEMA = new mongoose.Schema({
    foto: {
        type: String,
        required: [true, "la ruta de la canción es necesaria"]
    },
    relativepath: {
        type: String
    },
    hash: {
        type: String,
        required: [true, "la ruta de la imagen es necesaria"]
    },
    nombre: String,
    email: {
        type: String,
        required: [true, "El email es necesario"],
        validate: {
            validator: (value) => {
                return /^[\w\.]+@[\w\.]+\.\w{3,3}$/.test(value);
            },
            message: props => `${props.value} no es valido`
        }
        
    },
    password: {
        type: String,
        required: [true, "El password es necesario"],
    }
});
var user = mongoose.model("User", USERSCHEMA);
module.exports = user;
