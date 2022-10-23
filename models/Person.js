const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    username : {
        type: String,
   
    },
    name: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/4128/4128176.png"
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Person = mongoose.model("myPerson",PersonSchema)