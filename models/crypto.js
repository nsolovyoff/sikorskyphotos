const crypto = require('crypto');

const serverSalt = "asas";

const Image = require("../models/images");

function sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
}

function checkAuth(req, res, next) {
    if (!req.isAuthenticated()) return res.redirect("/auth/login");
    next();
}

function checkOwner(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("tak" + req.body.docid);
        Image.getById(req.body.docid)
            .then(image => {
                console.log("atreowner" + image.name);
                if (image.owner === req.user.login) {
                    console.log("oooo");
                    next();
                }
            })
            .catch(err => console.log(err));
    } else {
        res.redirect('/gallery')
    }
}

function checkAccess(req, res, next) {
    if (req.isAuthenticated()) {
        Image.getById(req.params.id)
            .then(image => {
                console.log("atreaccess" + image.name);
                if (image.users.includes(req.user.login)) {
                    next();
                }
            })
            .catch(err => console.log(err));

    } else {
        res.redirect('/gallery')
    }
}

function checkAdmin(req, res, next) {
    if (req.user.role !== 1) return res.redirect("/gallery");
    next();
}

module.exports = {
    serverSalt : serverSalt,
    sha512 : sha512,
    checkAdmin : checkAdmin,
    checkAuth : checkAuth,
    checkOwner : checkOwner,
    checkAccess : checkAccess,
};