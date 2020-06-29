const express = require('express');
const path = require('path');
const PORT = process.env.PORT;
//const PORT = 3000;
const mongoose = require('mongoose');
const app = express();
const User = require("./models/user");
const session = require('express-session');
const passport = require('passport');
const support = require('./models/crypto');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "qwe",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
const databaseUrl = 'mongodb://nikita:nikit1@ds127704.mlab.com:27704/heroku_fbp19xjt';
const connectOptions = { useNewUrlParser : true };

app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect(databaseUrl,connectOptions)
    .then(() => console.log(`Database connected: ${databaseUrl}`))
    .then(() => app.listen(PORT,() => console.log(`Server started: ${PORT}`)))
    .catch(err => console.log(`Start error: ${err}`));

//
// view engine setup
//app.engine('html', consolidate.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const userRouter = require("./routes/user");
app.use('/users',userRouter);

const imageRouter = require("./routes/images");
app.use('/gallery',imageRouter);

const albumRouter = require("./routes/album");
app.use('/albums',albumRouter);

const apiRouter = require("./routes/api");
app.use('/api',apiRouter);

const authRouter = require("./routes/auth");
app.use('/auth', authRouter);

app.use('/', express.Router().get('/', function(req, res) {
    res.render('index', {user: req.user});
}));

app.use('/about', express.Router().get('/', function(req, res) {
    res.render('about', {user: req.user});
}));

app.use('/profile',support.checkAuth,(req,res) =>{
    User.getById(req.user.id)
        .populate('collections')
        .exec()
        .then(user => {
            res.render('user', {usr: user, user : req.user})
        })
        .catch(err => res.status(500).send(err.toString()));



});
