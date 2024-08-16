var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'a#z5#znw$#YWFz@2nuZiWAk4!7Pv8IqJHg^qKsLc9gy@tJjwVz';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        iat: moment().unix(),
        exp: moment().add(1,'day').unix(),
    }

    return jwt.encode(payload,secret);
}