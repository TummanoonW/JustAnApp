var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://trialation:trialation27@cluster0.qt9ah.mongodb.net/MyApp?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

const User = mongoose.model('User', { username: String, email: String, password_hash: String });

const md5 = require('js-md5');

const appName = "MyApp";

let user = null;

/* GET home page. */
router.get('/', function(req, res, next) {
  let query = req.query;
  if(query.signout != undefined){
    if(query.signout){
      user = null;
      res.render('sign-in', { title: appName });
    }else{
      if(user != null) res.render('index', { title: appName, user: user});
      else res.render('sign-in', { title: appName });
    }
  }else{
    if(user != null) res.render('index', { title: appName, user: user});
    else res.render('sign-in', { title: appName });
  }
});

router.get('/sign-up', function(req, res, next) {
  res.render('sign-up', { title: appName });
});

router.get('/sign-up-completed', function(req, res, next) {
  res.render('sign-up-completed', { title: appName });
});

router.post('/', function(req, res, next) {
  let data = req.body;
  data.password_hash = md5(data.password);
  const newUser = new User(req.body);
  
  User.findOne({'email': data.email, 'password_hash': data.password_hash}, function(err, data){
    if (err){
      handleError(err)
    }else{
      if(data != null || data != undefined){
        user = data;
        res.render('index', { title: appName, user: data})
      }else{
        res.render('sign-in', {title: appName, tryagain: true})
      }
    }
  });
  //res.render('index', { title: appName });
});

router.post('/sign-up', function(req, res, next) {
  let data = req.body;
  data.password_hash = md5(data.password);
  const newUser = new User(req.body);
  
  User.findOne({'email': data.email}, 'email', function(err, user){
    if (err) return handleError(err);

    if(user != null || user != undefined){
      res.locals.message = "This user is already registered, please use other email addresses.";
      res.locals.error = {status: 555, stack: {}};
      res.status(err.status || 500);
      res.render('error');
    }else{
      newUser.save(function(err, doc){
        if (err) return handleError(err);
        else res.redirect('sign-up-completed');
      });
    }
  });

  //res.render(JSON.stringify(newUser));
});

function handleError(err){
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
}

module.exports = router;
