// imports
var mongoose = require("mongoose");
const express= require('express');
const app=  express();
const bodyParser=require('body-parser')
const session = require('express-session');



//Middle wares
app.use(bodyParser.json()); 
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(express.static("public"));
app.set("views", "./views");
app.set("view engine", "ejs");

// PORT 
const port=process.env.PORT || 3000;

app.listen(port);
console.log("Server connected to",{port})

const mongocon="mongodb+srv://abcd:abcd@cluster0.ksrqf.mongodb.net/myDB?retryWrites=true&w=majority";
mongoose.connect(mongocon, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log('info',"Connection Successful!");
});

db.collection('custdata').findOne({},(err,res)=>{
  console.log(res)
})


app.get("/",(req,res)=>{
  res.redirect('/index')
});

// index Route
app.get("/index",(req,res)=>{
  res.render('index')
});
