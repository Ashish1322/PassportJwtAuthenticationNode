const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const passport = require("passport");
const Person = require("../models/Person")
const key = require("../setup/myurl").secret

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key;




module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload,done)=> {
        
        Person.findById(jwt_payload.id)
        .then(person => {
            if(person)
            {
                return done(null,person);
            }
            else
            {
                return done(null, false)
            }

        })
        .catch(err => console.log(err))
    }) )
}