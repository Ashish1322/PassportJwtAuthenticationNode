const express = require("express")
const router = express.Router();
const passport = require("passport")
const Profile = require("../../models/Profile")
const Person = require("../../models/Person")
// find the profile of current lgged in person whose details are fething from token automaticaaly
router.get("/", passport.authenticate("jwt",{session: false}) ,(req,res)=> {
    Profile.findOne({user: req.user._id})
    .then( profile => {
        if(!profile)
        {
            return res.status(404).json({"profileError":"No Profile found"})
        }
        res.json(profile)
    })
    .catch(err => console.log("Got some error in profile "+ err))
})

// find the profile for specific person
router.get("/:username",(req,res)=> {
    Profile.findOne({username: req.params.username})
    .populate('user',['name','profilePic'])
    .then((profile)=>{
        if(!profile)
        {
            return res.status(404).json({success: "false",error:"Profile not found"})
        }
        res.status(200).json(profile)
    })
    .catch(err => console.log("Some error occured"))
})

router.get('/all/users',(req,res)=>{
    Profile.find()
    .populate('user',['name','profilePic'])
    .then(profiles => {
        if(!profiles)
        {
            return res.status(404).json({"error":"No profiles found"})
        }
        
        return res.status(200).json({profiles})
    })
    .catch(err => console.log(err))
})


router.post("/",passport.authenticate("jwt",{session: false}),
    (req,res)=> {

        // Creating profile object
        const profileValues = {};
        profileValues.user = req.user._id,
        profileValues.username = req.body.username,
        req.body.website ?  profileValues.website = req.body.website : null;
        req.body.country ?  profileValues.country = req.body.country : null;
        req.body.portfolio ? profileValues.portfolio = req.body.portfolio : null;
        profileValues.social = {}
        req.body.youtube ? profileValues.social.youtube = req.body.youtube : null;
        req.body.facebook ? profileValues.social.facebook = req.body.facebook : null;
        req.body.instagram ? profileValues.social.instagram = req.body.instagram : null;

        if(typeof req.body.languages !== undefined)
        {
            profileValues.languages = req.body.languages.split(",")
        }

        // check if the profile with the current logged in user exists or not
        Profile.findOne({user: req.user._id})
        .then(
            profile => {
                // if profile exists then update it 
                if(profile)
                {
                    Profile.findOneAndUpdate({user: req.user._id},{$set: profileValues},{new:true})
                    .then( profile => res.status(200).json(profile))
                    .catch(err => console.log("Problem in update "+err))
                }
                // else creaet a new profile
                else
                {
                    // before creating a new profile check if the username is taken or not
                    Profile.findOne({username: req.body.username})
                    .then( profile => {
                        if(profile)
                        {
                            return res.status(400).json({"username": "Username Already Exists"})
                        }
                       
                        new Profile(profileValues).save()
                        .then( profile => res.status(200).json(profile))
                        .catch("Error occured while creating profile "+err)
                        
                    })
                    .catch(err => console.log("Some error Occured"))
                }
            }
        )
        .catch(err => console.log("Some error occured "+err))



    
    })

router.delete("/",passport.authenticate("jwt",{session: false}), (req,res)=> {
    Profile.findOne({user: req.user._id}).then(profile => {
        if(!profile)
        {
          return  res.status(404).json({"error":"Profile not found"})
        }
        Profile.findOneAndRemove({user: req.user._id}).then(
            // after removing profile remove user also
            () => {
                Person.findOneAndRemove({_id: req.user._id})
                .then( () => {
                    res.status(200).json({"success":'delete succefully'})
                })
                .catch(err => console.log(err))
            }
        ).catch(err => console.log(err))
    }).catch(err => res.status(404).json({error: err}))
})

router.post("/workrole/mywork",passport.authenticate("jwt",{session: false}) , (req,res) => {
    Profile.findOne({user: req.user._id})
    .then((profile)=> {
        if(!profile)
        {
            return  res.status(404).json({"error":"Profile not found"})
        }

        const newWork = {
            role: req.body.role,
            company: req.body.company,
            country: req.body.country,
            current: req.body.current,
            details: req.body.details
        };
        profile.workrole = [...profile.workrole, newWork]
        profile.save().then( profile => res.json(profile)).catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})


router.delete("/delete/:id",passport.authenticate("jwt",{session: false}) , (req,res)=>{
    Profile.findOne({user:req.user._id})
    .then( profile=> {
        if(!profile)
        return  res.status(404).json({"error":"Profile not found"})

        const removeThis = profile.workrole.map(item => item._id).indexOf(req.params.id)

        profile.workrole.splice(removeThis,1);

        profile.save().then( profile => res.json(profile)).catch(err => console.log(err))

    })
    .catch(err => console.log(err))
})



module.exports = router