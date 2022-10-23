// ashish1322
// Ashish123.

const express = require("express")
const mongoose = require("mongoose")
const bodyparser = require("body-parser")
const passport = require("passport")

// middlewares
const app = express()
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())


// bring all routes
const auth = require("./routes/api/auth")
const profile = require("./routes/api/profile")
const questions = require("./routes/api/questions")

// db connection attempt
const db = require("./setup/myurl").mongoURL
mongoose
  .connect(db)
  .then(()=> console.log("Connected Successfully"))
  .catch((err)=> console.log(err))

// passport middle
app.use(passport.initialize())
// configure jwt startegy
require("./strategies/jsonWtStrategy")(passport)

app.use("/api/auth",auth)
app.use("/api/questions",questions)
app.use("/api/profile",profile)

const port = process.env.PORT || 3001
app.get("/",(req,res)=> {
  res.send("hi")
})


app.listen(port, ()=> console.log("Listening at port " + port))