const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const passport = require("passport")
const key = require("../../setup/myurl").secret
const Person = require("../../models/Person")


router.get("/", (req,res) => {
    res.json({text: "Auth is working"})
})

router.post("/register", (req,res) => {
    Person.findOne({email: req.body.email}).then((person)=> {
        if (person)
        {
            return res.status(400).json({"error":"Email Already Exists"})
        }
        else 
        {
            // encrypt password using bcrypt
          
            bcrypt.hash(req.body.password, 10, function(err, hash) {
                if(err) throw err;
                const person = new Person( {
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                })
                person.save().then(person => res.status(200).json(person)).catch(err => console.log(err))
                // Store hash in your password DB.
            });
           
        }
    }).catch( err => console.log(err))
})

router.post("/login",(req,res)=> {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({email}).then(
        person => {
            if(!person)
            {
               return res.status(404).json({emailerror: "emailNotFound"})
            }
            bcrypt.compare(password,person.password).then((isVerified)=> {
                if(isVerified)
                {
                    // create a token of payload using jwt
                    const payload = {
                        id: person._id,
                        name: person.name,
                        email: person.email,
                    }
                    jwt.sign(
                        payload,
                        key,
                        {expiresIn: '1h'},
                        (err,token) => {
                            if(err)
                            return res.json({success: false})
                            else
                            return res.status(200).json({success: true,token:"Bearer "+token})
                        }
                    )

                }
                else
                {
                    return res.status(400).json({passwordError:"Password is not correct"})
                }
            }).catch(err => {
                console.log(err)
            })
            
        }
    ).catch(err => console.log(err))
})

router.get("/profile",passport.authenticate('jwt', {session: false}),(req,res)=> {
    res.send(req.user)
})


module.exports = router;

// BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNDQ1ZTAzNmQ1YmFmMTQxM2VmMWY3MSIsIm5hbWUiOiJhc2hpc2giLCJlbWFpbCI6ImEubTIwMG5vdkBnbWFpbC5jb20iLCJpYXQiOjE2NjU0NzU1MjEsImV4cCI6MTY2NTQ3OTEyMX0.JJyDfzs9t0SHA6ogGFMqhQGYZBG749uvFuHDnc2qaOg