const express = require('express');

const router = express.Router();


const support = require('../models/crypto');
const passport = require('../models/passport');

const User = require("../models/user");

router.post('/register', (req, res) => {
  let login = req.body.login;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  let fullname = req.body.fullname;
  let bio =req.body.bio;

  if (!User.isUniqueUsername(login)) {
      res.redirect('/auth/register?error=Username+already+exists');
      return;
  }
    if (password !== confirmPassword) {
        res.redirect('/auth/register?error=Passwords+do+not+match');
        return;
    }
  
      User.insert(new User(login,support.sha512(password, support.serverSalt).passwordHash,fullname,0,"hello",bio,false))
        .then( () => {
          console.log(login," is successfully registered");
          res.redirect('/auth/login');
        })
        .catch(err => res.send(err.toString()+" is happened"));
  
    //res.redirect('../../');
});

router.get('/login', function(req, res) {
  
  console.log(`get login`);
  //console.log(req.user +"auth.js 62");
  res.render('login', {user : req.user});
});

router.get('/register', function(req, res) {
  res.render('register', {user : req.user});
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/gallery',
    failureRedirect: '/auth/login?error=Wrong+login+or+pssword'
}));
/*
router.post('/login', function (req, res) {
    passport.authenticate('local', function (err, user) {
        req.logIn(user, function (err) { // <-- Log user in
            return res.redirect('/');
        });
    })(req, res);

});*/


router.get('/logout', support.checkAuth, function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;