const express = require("express")
const router = express.Router()
const passport = require("passport")

const Profile = require("../../models/Profile")
const Person = require("../../models/Person")
const Question = require("../../models/Question")


// api/questions
router.post("/",passport.authenticate("jwt",{session: false}), (req,res)=> {
    const newQuestion = {}
    newQuestion.user = req.user._id;
    newQuestion.textone = req.body.textone;
    newQuestion.texttwo = req.body.texttwo;
    newQuestion.name = req.user.name;

    new Question(newQuestion).save().then((question)=> {
        res.status(400).json(question)
    })
    .catch(err => console.log(err))

})

router.get("/",(req,res)=> {
    Question.find().sort("-date").then((data)=> res.status(200).json(data) ).catch(err => console.log(err))
})

router.post("/answer/:qid",passport.authenticate("jwt",{session: false}), (req,res)=>{
    const newAns = {}
    newAns.user = req.user._id;
    newAns.text = req.body.text;
    newAns.name = req.user.name;

    Question.findOne({_id: req.params.qid}).then((ques)=> {
        if(!ques)
        {
            return res.status(404).json({"error":"Question doen't exits anymore"})
        }
        ques.answers = [...ques.answers,newAns];
        ques.save().then(ques => res.json(ques)).catch(err=>console.log(err))
    } ).catch((err)=> console.log(err))

})

router.post("/upvote/:qid",passport.authenticate("jwt",{session: false}), (req,res)=> {
   
    Question.findOne({_id: req.params.qid})
    .then((ques)=> {
        if(!ques)
        {
            return res.status(404).json({"error":"Question doen't exits anymore"})
        }
        // check if the current user has alreday upvoted or not
        if( ques.upvotes.filter( (upvote) => upvote.user.toString() === req.user._id.toString()).length > 0)
        {
            return res.status(404).json({"error":"Already Upvoted"})
        }

        ques.upvotes = [...ques.upvotes,{user: req.user._id}]
        ques.save().then( q => res.json(q)).catch(err => console.log(err))
    } )
    .catch((err)=> console.log(err))
})

module.exports = router