// imports
var mongoose = require("mongoose");
const express= require('express');
const app=  express();
const bodyParser=require('body-parser')
const session = require('express-session');
const { contains } = require("cheerio");

//Middle wares
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

const result=[]

app.get("/",(req,res)=>{
  res.redirect('index')
});

// index Route
app.get("/index",(req,res)=>{
 var mysort = { time: -1 };
 db.collection("custdata").find({}).sort(mysort).toArray(function(err, result) {
   if (err) throw err;
  console.log(result)
  res.render('index',{result:result})
 });
  
});

app.get('dis',(req,res)=>{
  var mysort = { time: -1 };
  db.collection("custdata").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;

   console.log(result)
  });
  res.write(result)
})

app.use(bodyParser.json()); 
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.post('/new_cust', urlencodedParser,function(req,res){
  var name = req.body.name;
  var email =req.body.email;
  var pass = req.body.password;
  var phone =req.body.phone;

  var data = {
      "name": name,
      "email":email,
      "password":pass,
      "phone":phone
  }
db.collection('custdata').insertOne(data,function(err, collection){
      if (err) throw err;
      console.log("Record inserted Successfully");
            
  });
        
  return res.redirect('/index');
})