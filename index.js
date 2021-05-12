// imports
var mongoose = require("mongoose");
const express= require('express');
const app=  express();
const bodyParser=require('body-parser')
const session = require('express-session');
const logger=require('./logger');


//Middle wares
app.use(bodyParser.json()); 
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(express.static("public"));
app.set("views", "./views");
app.set("view engine", "ejs");

// PORT 
const port=Process.env.PORT || 3000;

app.listen(port, ()=>logger.log('info',`Server connected to ${port}`));
//Mongo Connection section
const mongocon="mongodb+srv://abcd:abcd@cluster0.ksrqf.mongodb.net/myDB?retryWrites=true&w=majority";
mongoose.connect(mongocon, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  logger.log('info',"Connection Successful!");
});

//Mongo Schema 
var userSchema = mongoose.Schema({
  username:String,email:String,password:String,mobile:Number,name:String,dob:String,aadhar:Number,address:String,bank_name:String,moratorium_acc:Number,status:Boolean
});


//Mongo Model
var userModel = mongoose.model('usermodel', userSchema,'user');
var sess;
var loginState=false;
var registerState=false;
var registerFail=false;
var logout=false;


// ROUTES

app.get("/",(req,res)=>{
    var mysort = { time: -1 };
    db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      loginState=false;
      registerState=false;
      registerFail=false;
      logout=false;
      res.render('index', { result:result ,status:result[0]['status'],state:loginState,regstate:registerState,regfail:registerFail,logout:logout});  
    });
});

// index Route
app.get("/index",(req,res)=>{
    var mysort = { time: -1 };
    db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      loginState=false;
      registerState=false;
      registerFail=false;
      logout=false;
      res.render('index', { result:result,status:result[0]['status'],state:loginState,regstate:registerState,regfail:registerFail,logout:logout });
    });
});


// login Route
app.get('/login',(req,res)=>{
  sess = req.session;
    if(sess.email) {
        console.log("User on Session:-  "+sess.email) 
    }
    else {
        console.log('User Not Found');   
        console.log('Please, Login first'); 
        res.redirect('/index');
    }
  var mysort = { time: -1 };
  loginState=false;
  registerState=false;
  registerFail=false;
  logout=false;
  var details=[];


db.collection("moratorium").find({email:sess.email}).toArray(function(err, result1) {
  if (err) throw err;
  details=result1
})

   db.collection("user").find({email:sess.email}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log(loginState)
    res.render('login', {result:result,status:result[0]['status'],state:loginState,regstate:registerState,regfail:registerFail,logout:logout,details:details});

})
})

app.get('/loginsuccess',(req,res)=>{

    sess = req.session;
      if(sess.email) {
          logger.log('info',"Session Created for User:-  "+sess.email) 
      }
      else {
          logger.log('error','User Not Found');   
          logger.log('error','Please, Login first'); 
          res.redirect('/index');
      }
      var details=[];
    
      db.collection("moratorium").find({email:sess.email}).toArray(function(err, result1) {
        if (err) throw err;
        details=result1
      })

    var mysort = { time: -1 };
    loginState=true;
     db.collection("user").find({email:sess.email}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      console.log(loginState)
      res.render('login', {result:result,status:result[0]['status'],state:loginState,details:details});
    });
  })

  app.get("/loginfail",(req,res)=>{
    var mysort = { time: -1 };
    db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      loginState=true;
      registerState=false;
      registerFail=false;
      logout=false;
      
      res.render('index', { result:result, status:result[0]['status'],state:loginState,regstate:registerState,regfail:registerFail,logout:logout,details:details});
    });
  });
  
  

// home Route
app.get('/home',(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    res.render('home', {result:result });
  });
});

// register Route
app.post('/register', urlencodedParser, function (req, res) {
    var username = req.body.username; 
    module.exports=username
    var email =req.body.email1; 
    var pass = req.body.password; 
    var pass1 = req.body.password1; 
    var status=false;


  var data =new userModel({ 
      "username": username, 
      "email": email, 
      "password": pass,
      "status":status
  }) 
 
if(pass===pass1){
    db.collection('user').findOne({ email: email }, function(err, doc){
      if(err) throw err;
      if(!doc) {
        logger.log('error','Not Found:'+email)
        db.collection('user').insertOne(data,function(err, collection){ 
          if (err) throw err;
          console.log(data);
          logger.log('info',"Record inserted Successfully"); 
          }); 
        res.redirect('/registersuccess')
      }else {
          logger.log('info',"Found: " + email);
          res.redirect('/registerfail')
      }

    });
}else{
  logger.log('error','Password not matched');
  res.redirect('/registerfail')
}
})

app.get("/registersuccess",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    registerState=true;
    loginState=false;
    registerFail=false;
    logout=false;
    logger.log('info',"User Registered Successfully"); 
    res.render('index', { result:result,regstate:registerState,state:loginState,regfail:registerFail,logout:logout });
  });
});

app.get("/registerfail",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    registerState=false;
    loginState=false;
    registerFail=true;
    logout=false;
    logger.log('error',"User not registered"); 
    res.render('index', { result:result,regstate:registerState,state:loginState,regfail:registerFail,logout:logout });
  });
});

// auth Route
app.post('/auth', urlencodedParser, function (req, res) {
  var email = req.body.login_email; 
  var pass = req.body.login_pass;
 
  db.collection('user').findOne({email: email, password: pass }, function(err, doc){
    if(err) throw err;
    if(doc) {
      logger.log('info',"Login Successfully!!");
      logger.log('info',"Welcome, "+email); 

      sess = req.session;
      sess.email = req.body.login_email;
      if(sess.email) {
        return res.redirect('/loginsuccess');
    }
      res.redirect('/login')
    } else {
        logger.log('error',"Wrong Credentials ");
        res.redirect('/loginfail')
    }
    
});
})

// logout Route
app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return logger.log('error',err);
        }
        logger.log('info','Logout!!')
        logger.log('warn','Session Terminated!!!')
        res.redirect('/logoutsuccess');
    });
});

app.get("/logoutsuccess",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    loginState=false;
    registerState=false;
    registerFail=false;
    logout=true;
    
    res.render('index', { result:result,state:loginState,regstate:registerState,regfail:registerFail,logout:logout });
  });
});

// update Route
app.post('/update', urlencodedParser, function (req, res) {
  var name = req.body.update_name; 
  var mobile =req.body.update_mobile; 
  var aadhar = req.body.update_aadhar; 
  var bank = req.body.update_bank; 
  var acc =req.body.update_acc; 
  var address = req.body.update_address; 
  var dob = req.body.update_dob; 


  var myquery = { email: sess.email };
  var newvalues = { $set: {"name":name,"mobile":mobile,"dob":dob,"aadhar":aadhar,"address":address,"moratorium_acc":acc,"bank_name":bank,"status":true } };

  db.collection("user").updateOne(myquery, newvalues, function(err,r) {
    if (err) throw err;
  
    logger.log('info',"Information Updated!!");
    
  });
  res.redirect('/login');  
  });

  // contact route
  app.post('/contact', urlencodedParser, function (req, res) {
    var contact_name = req.body.contact_name; 
    var contact_email =req.body.contact_email; 
    var contact_subject = req.body.contact_subject; 
    var contact_message = req.body.contact_message; 
    
    // console.log("session in contact"+sess.email)
     sess=req.session;
     console.log(sess.email)
  var data ={
      "contact_name": contact_name, 
      "contact_email": contact_email, 
      "contact_subject": contact_subject,
      "contact_message":contact_message }
    db.collection('contact').insertOne(data,function(err,result){ 
      if (err) throw err;
      console.log(data);
      logger.log('info',"Record inserted Successfully"); 
      }); 
      if(sess.email!=null){
        res.redirect('/home')
      }else{
      res.redirect('/index')
      }
})



//Andriod API's

// login Route
app.post('/api_auth',urlencodedParser,function (req, res) {
  var email = req.body.email; 
  var pass = req.body.password;
  //Getting particular moratorium details of user
  db.collection("moratorium").find({email:email}).toArray(function(err, result1) {
    if (err) throw err;
    details=result1
  })
  //Getting details of user
  db.collection("user").find({email:email}).toArray(function(err, result) {
    if (err) throw err;
    userdata=result
  })  
  //Checking Credentials for User Login
  db.collection('user').findOne({email: email, password: pass }, function(err, doc){
    if(err) throw err;
    if(doc) {

      res.send({login_status:"Success",userdata:userdata,details:details})
    } else {

        console.log(email,pass)
        res.send({login_status:"Fail"})
    }
});
})

app.post('/api_reg', urlencodedParser, function (req, res) {
  var username = req.body.username; 
  var email =req.body.email1; 
  var pass = req.body.password; 
  var status=false;
var data =new userModel({ 
    "username": username, 
    "email": email, 
    "password": pass,
    "status":status
}) 
  db.collection('user').findOne({ email: email }, function(err, doc){
    if(err) throw err;
    if(!doc) {
      db.collection('user').insertOne(data,function(err, collection){ 
        if (err) throw err;
        console.log(data);
        logger.log('info',"Record inserted Successfully"); 
        }); 
      res.send({register_status:"Success",userdata:data})
    }else {
        logger.log('info',"Found: " + email);
        res.send({register_status:"Fail,Email already exist!"})
    }

  });

})

app.get("/api_news",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    loginState=false;
    registerState=false;
    registerFail=false;
    logout=false;
    res.send({news:result});  
  });
})


// 



