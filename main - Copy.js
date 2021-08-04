const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 5000;

const jwt_secret = 'Keep it secret';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assests')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(session({
//     name: 'app.sid',
//     secret: 'Keep it secret',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         secure: false
//     }
// }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 1000000 }
});

function checkFileType(file, cb) {
    const fileTypes = /jpeg|png|jpg|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb('Error: Images Only');
    }
}

app.get('/', verifyToken, (req, res) => {
    // if (req.session.signedIn) {
    //     readProductsFromFile((products) => {
    //         res.render('home.ejs', {
    //             username: req.session.username,
    //             logout: true,
    //             products: products[0],
    //         });
    //     });
    if (req.token !== null) {
        console.log(req.token);
        res.render('home.ejs');
    } else {
        res.render('index.ejs');
    }
});

app.get('/login', (req, res) => {
    res.render('./accounts/login.ejs', {
        error: ''
    });
});

app.get('/signup', (req, res) => {
    res.render('./accounts/signup.ejs', {
        error: ''
    });
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    readUsersFromFile(function (users) {
        const filteredUser = users.filter(user => {
            return (user.email === email && user.password === password);
        });
        if (!filteredUser.length) {
            res.render('./accounts//login', {
                error: 'Not a User, Sign Up first'
            });
        } else {
            // req.session.signedIn = true;
            // req.session.email = email;
            // req.session.username = filteredUser[0].username;
            // console.log(req.session);
            res.redirect('/');
        }
    });
});

app.post('/signup', upload.single('profile'), (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;
    const profileImgName = req.file.filename;

    if (password === confirmPassword) {
        readUsersFromFile(function (users) {
            const filteredUser = users.filter(user => {
                return user.email === email;
            });
            if (filteredUser.length) {
                res.render('./accounts/signup', {
                    status: false,
                    error: 'User Already Exists, Please LogIn'
                });
            } else {
                let obj = {
                    username: username,
                    email: email,
                    password: password,
                    profileImgName: profileImgName
                }
                users.push(obj);
                let userData = {
                    username: username,
                    email: email
                }
                jwt.sign(userData, jwt_secret, { expiresIn: '20m' }, (err, token) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(token);
                        updateUsersToFile(JSON.stringify(users), function (err) {
                            if (err) {
                                res.render('/signup', {
                                    error: 'Error while Signing you in, Please try again.'
                                });
                            } else {
                                // req.session.signedIn = true;
                                // req.session.email = email;
                                // req.session.username = username;
                                res.redirect('/');
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.render('/signup', {
            alert: `Password doesn't match`
        });
    }
});

app.get('/loadMore', (req, res) => {
    readProductsFromFile(fileData => {
        if (fileData.length === 0) {
            res.end('No Products to Show');
        }
        res.send(JSON.stringify(fileData));
    });
});

app.get('/logout', (req, res) => {
    // req.session.destroy(err => {
    //     if (err)
    //         console.log('Error in destroying session.');
    //     res.redirect('/');
    // });
});

// VERIFY TOKEN
function verifyToken(req, res, next) {
    console.log(req.headers['authorization'])
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        if (bearerToken === null) {
            res.sendStatus(401);
            console.log('bearerToken is null');
        }
        jwt.verify(bearerToken, jwt_secret, (err, authData) => {
            console.log(err);
            if (err) {
                return res.sendStatus(403);
            }
            req.token = authData;
            next();
        });
    } else {
        res.render('index.ejs');
    }
}

function readUsersFromFile(callback) {
    fs.readFile('./users.txt', 'utf-8', (err, fileData) => {
        if (err) {
            console.log('No such file or directory exists');
            return;
        }
        fileData = fileData.length ? JSON.parse(fileData) : [];
        callback(fileData);
    });
}

function updateUsersToFile(fileData, callback) {
    fs.writeFile('./users.txt', fileData, (err) => {
        callback(err);
    });
}

function readProductsFromFile(callback) {
    fs.readFile('./products.txt', 'utf-8', (err, fileData) => {
        fileData = fileData.length ? JSON.parse(fileData) : [];
        callback(fileData);
    });
}

app.listen(port, (err) => {
    console.log(`App is Listening http://localhost:${port}`);
});