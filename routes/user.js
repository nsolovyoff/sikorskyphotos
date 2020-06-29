const express = require('express');

const router = express.Router();

const User = require("../models/user");

const support = require('../models/crypto');




router.use('/:id', support.checkAuth, function (req, res, next) {
    const userStr = req.params.id;
    User.getByLogin(userStr)
        .then (user => {
            if (!user) {
                const err = new Error('Not found');
                err.status = 404;
                next(err);
                res.send("User not found");
            }
            res.render('user', {usr: user, user : req.user})
        })
        .catch(err => console.log(err));
});

router.use('/', support.checkAdmin, express.Router().get('/', function(req, res) {
    User.getAll()
        .then(users => {
            res.render('users', {users: users, user : req.user});
        })
        .catch(err => console.log(err));
}));

module.exports = router;