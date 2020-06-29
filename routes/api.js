const express = require('express');

const router = express.Router();

const support = require('../models/crypto');

const User = require("../models/user");

router.use("/users/:id", support.checkAuth, support.checkAdmin, function (req, res, next) {
    const userIdStr = req.params.id;
    const userId = parseInt(userIdStr);
    User.getById(userId)
        .then(user => {
            if (!user) {
                const err = new Error('Not found');
                err.status = 404;
                next(err);
                res.send("User not found");
            }
            res.send(user);
        })
        .catch(err => console.log(err));
});

router.use("/users", support.checkAuth, support.checkAdmin, function (req, res) {
    User.getAll()
        .then(users => {
            res.send(users);
        })
        .catch(err => console.log(err));
});


module.exports = router;