const express = require('express');

const router = express.Router();

const Image = require("../models/images");

const path = require('path');

const fs = require("fs-promise");

const support = require('../models/crypto');

const multer = require('multer');

const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: "solovyoff",
    api_key: "226392755241676",
    api_secret: "emsDOzajXTxXnh2wQSWUORVUYQM"
});

const cloudinaryStorage = require("multer-storage-cloudinary");

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "demo",
    allowedFormats: ["jpg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
});
const parser = multer({ storage: storage });

router.post('/sharePage',  support.checkAuth, support.checkOwner, async(req, res) => {
    res.render('share', {docid: req.body.docid});
});

router.post('/share', support.checkAuth, support.checkOwner, async (req, res) => {
    console.log("da" + req.body.shareUsername);
    Image.shareImage(req.body.docid, req.body.shareUsername)
        .then(x => {
            console.log("da");
            res.redirect("/gallery")
        })
        .catch(err => console.log(err));
});

router.post('/add', support.checkAuth, parser.single('image'), function(req, res) {
    console.log("1." + req.file.url, "2", req.file.public_id);
    let item = {};
    item["img"] = req.file.url;
    item["img_id"] = req.file.public_id;
    item["name"] = req.body.name;
    item["likes"] = 33;
    const d = new Date();
    let users = [];
    users.push(req.user.login);
    item["added"] = d.toISOString();
    item["users"] = users;
    item["owner"] = req.user.login;
    Image.insert(item)
        .then(id => {
            res.redirect("/gallery");
        })
        .catch(err => console.log(err));
});

router.post('/delete', support.checkAuth, support.checkOwner, function(req, res) {
    const id = req.body.docid;
    Image.getById(id)
        .then(img => {
            return cloudinary.v2.uploader.destroy(img.img_id);
        })
        .then(x => {
            return Image.delete(id);
        })
        .then(x => {
            res.redirect('/gallery')
        });
});

router.use('/add', support.checkAuth,function(req, res) {
    res.render('add', {user : req.user});
});

router.use('/:id', support.checkAuth, support.checkAccess,function(req, res, next) {
    const imageIdStr = req.params.id;
    let owner = 0;
    Image.getById(imageIdStr)
        .then(image => {
            if (!image) {
                const err = new Error('Not found');
                err.status = 404;
                next(err);
                res.send("Image not found");
            }
            if (image.owner === req.user.login) {
                owner = 1;
            }
            res.render('image', {image: image, user : req.user, owner: owner});
        })
        .catch(err => console.log(err));
});

router.use('/',support.checkAuth, function(req, res) {
    let imagesAccessible;
    Image.imageGetAccessible(req.user.login)
        .then(imgAccessible => {
            imagesAccessible = imgAccessible;
            return Image.imageGetOwned(req.user.login)
        })
        .then(imagesOwned => {
            if (req.query.searchId) {
                let searchResult = [];
                for (let img of imagesOwned) {
                    if (img.name.includes(req.query.searchId)) {
                        searchResult.push(img);
                    }
                }
                imagesOwned = searchResult;
            }
            const pages = Math.ceil(imagesOwned.length / 9);
            let page = 1;
            if (req.query.page) {
                page = req.query.page;
            }
            imagesOwned.splice(0, (page - 1) * 9);
            imagesOwned.splice(9, 9e9);
            res.render('gallery', {imagesOwned: imagesOwned, imagesAccessible: imagesAccessible, page: page, pages: pages, searchQuery: req.query.searchId, user : req.user});
        })
        .catch(err => console.log(err));
});



module.exports = router;