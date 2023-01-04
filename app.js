const mongoose = require('mongoose')
// const PORT = 3000;
const dotenv = require("dotenv")
dotenv.config()
const dbUrl =process.env.connectionString

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(dbUrl, connectionParams).then().catch()
const flash = require('connect-flash')
const express = require('express')
const session=require('express-session')
const nocache = require("nocache");
const app = express()
app.use(nocache());

app.use(session({
  secret:process.env.sessionSecret,
  saveUninitialized:true,
  resave:false
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(flash());

app.use('/', express.static('public'))

app.set('view engine', 'ejs')

const userRoutes = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')

app.use('/admin', adminRoute)
app.use('/', userRoutes)
app.listen(3000)
