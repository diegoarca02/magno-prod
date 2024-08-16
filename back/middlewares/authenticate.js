
'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'a#z5#znw$#YWFz@2nuZiWAk4!7Pv8IqJHg^qKsLc9gy@tJjwVz';

exports.decodeToken = function(req,res,next){

    if(!req.headers.authorization){
        return res.status(403).send({message: 'NoHeadersError'});
    }

    var token = req.headers.authorization.replace(/['"]+/g,'');

    var segment = token.split('.');

    if(segment.length != 3){
        return res.status(403).send({message: 'InvalidToken'});
    }else{
        try {
            var payload = jwt.decode(token,secret);
            if(payload.exp <= moment().unix()){
                return res.status(403).send({message: 'TokenExpirado'});
            }

        } catch (error) {
            console.log(error);
            return res.status(403).send({message: 'ErrorToken'});
        }
    }

    req.user = payload;

    next();

}