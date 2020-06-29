const User = require('./user.js');


const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');

const support = require('./crypto');

passport.serializeUser(function(user, done) {
    done(null, user._id);

});


passport.deserializeUser(function(id, done) {
    User.getById(id)
    .then(user => {
        done(null, user);
    })
    .catch(err => {
        done(err, null);
    }); 
});


passport.use(new LocalStrategy(
    function (username, password, done) {
        let hash = support.sha512(password, support.serverSalt).passwordHash;
        console.log(username, hash);
        User.getUserByLoginAndPassword(username, hash)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                console.log(err.message);
                done(err, null);
            });
    }
));



module.exports = passport;