const express = require('express');

const router = express.Router();

const support = require('../models/crypto');

const Album = require("../models/albums");

const Image = require("../models/images");

const User = require("../models/user");

router.post('/addAlbum', support.checkAuth, function(req, res) {
    let item = {};
    item["name"] = req.body.name;
    item["images"] = req.body.images;
    let users = [];
    users.push(req.user.login);
    item["users"] = users;
    const d = new Date();
    item["added"] = d.toISOString();
    item["owner"] = req.user.login;
    Album.insert(item)
        .then(id => {
            res.redirect("/albums");
        })
        .catch(err => console.log(err));
});

router.post('/:id', support.checkAuth, function(req, res) {
    let id =req.params.id;
    console.log("hello" + id);
    Album.delete(id)
        .then(album =>{
            console.log("Album is succesfuly deleted");
            res.redirect('/albums');
        })
        .catch(err => res.send(err.toString()+" is happened"))
});

router.use('/addAlbum',  support.checkAuth, function(req, res) {
    Image.imageGetOwned(req.user.login)
        .then(images => {
                res.render('addAlbum',{images: images , user : req.user});
            })
});

router.use('/:id', support.checkAuth,function(req, res) {
    let id = req.params.id;
    Album.getById(id)
        .populate("images")
        .exec()
        .then(album => {
            images = album.images;
            const pages = Math.ceil(images.length / 9);
            let page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
            images.splice(0, (page - 1) * 9);
            images.splice(9, 9e9);
            res.render('album', {images: images, page: page, pages: pages, album: album, user : req.user});
        })
        .catch(err => console.log(err));
});

router.use("/",support.checkAuth,function(req,res){
    Album.albumGetOwned(req.user.login)
        .then(albums => {
            const pages = Math.ceil(albums.length / 9);
            let page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
            albums.splice(0, (page - 1) * 9);
            albums.splice(9, 9e9);
            res.render("albums",{albums: albums, pages: pages, page: page, user : req.user})
        })
        .catch(err => res.status(500).send(err.toString()));
});

module.exports = router;