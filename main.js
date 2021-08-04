require('dotenv').config()
const express = require('express');
const jwt = require('jsonwebtoken');
const mailjet_client = require('node-mailjet');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { stringify } = require('querystring');
const app = express();
const port = 5000;

const jwt_secret = 'the most secret string of text in history';
const mailjet = mailjet_client.connect('f30faec486f81526079f200173d1385a', 'c3e524c5419f727bab0d9b4cd16251bf');
let productStart = 0, productEnd = 0;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// middileware to verify the admin and users as well
app.use('/', (req, res, next) => {
    jwt.verify(req.cookies.cookieToken, jwt_secret, (err, decoded) => {
        if (err) {
            req.profile = {};
            next();
        } else {
            req.profile = decoded;
            next();
        }
    });
});

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

app.get('/', (req, res) => {
    jwt.verify(req.cookies.cookieToken, jwt_secret, (err, decoded) => {
        if (err) {
            res.render('index.ejs');
        } else {
            filterUser(decoded, (filteredUser) => {
                if (!filteredUser.isAdmin) {
                    if (filteredUser.isVerified) {
                        readProductsFromFile(products => {
                            const product = [];
                            productEnd = 5;
                            for (let i = productStart; i < productEnd; ++i) {
                                product.push(products[i]);
                            }
                            readCartItemsFromFile((cart) => {
                                res.render('users/home.ejs', {
                                    username: decoded.username.split(' ')[0],
                                    email: decoded.email,
                                    isAdmin: decoded.isAdmin,
                                    profileImage: filteredUser.profileImgName,
                                    products: product,
                                    logout: true,
                                    cartItems: cart
                                });
                            });
                        });
                    } else {
                        res.send(`
                                Your Account is not Verified Yet, <a href="/verifyUser?username=${filteredUser.username}&email=${filteredUser.email}&verificationKey=${filteredUser.verificationKey}">Click Here to Verify</a>
                        `);
                    }
                } else {
                    res.redirect('/admin');
                }
            });
        }
    });
});

app.get('/login', (req, res) => {
    jwt.verify(req.cookies.cookieToken, jwt_secret, (err, decoded) => {
        if (err) {
            res.render('accounts/login.ejs', {
                error: ''
            });
        } else {
            res.redirect('/');
        }
    });
});

app.get('/forgot_password', (req, res) => {
    res.render('accounts/forgotpassword.ejs', {
        error: ""
    });
});

app.post('/forgot_password', (req, res) => {
    const email = req.body.email;
    readUsersFromFile((users) => {
        filteredUser = users.find(user => {
            return user.email === email;
        });
        if (filteredUser) {
            filteredUser.status = true;
            res.send(JSON.stringify(filteredUser));
        } else {
            res.send(JSON.stringify({
                status: false,
                error: 'Invalid User'
            }));
        }
    });
});

app.get('/reset_request', (req, res) => {
    const user = {
        username: req.query.username,
        email: req.query.email,
        verificationKey: req.query.verificationKey
    }
    res.send('<center style="font-size: 1.2rem;"> A Password Reset Mail has been send to you, Please Check you Mail Spam section</center');
    userPasswordReset(user);
});

app.get('/user/password_reset_request', (req, res) => {
    res.render('accounts/resetpassword.ejs', {
        verificationKey: req.query.verification_key
    });
});

app.post('/user/password_reset_request', (req, res) => {
    const verificationKey = req.query.verification_key;
    const updatedPassword = req.body.password;
    readUsersFromFile(function (users) {
        for (let i = 0; i < users.length; ++i) {
            if (users[i].verificationKey === verificationKey) {
                users[i].password = updatedPassword;
                break;
            }
        }
        updateUsersToFile(JSON.stringify(users), (err) => {
            if (err) {
                res.json({
                    status: false,
                    error: `Error occured while updating your Password. Please try again Later`
                });
            } else {
                res.json({
                    status: true,
                    message: `Password successfully Updated.`
                });
            }
        });
    });
});

app.get('/signup', (req, res) => {
    jwt.verify(req.cookies.cookieToken, jwt_secret, (err, decoded) => {
        if (err) {
            res.render('accounts/signup.ejs', {
                error: ''
            });
        } else {
            res.redirect('/');
        }
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
            res.render('accounts/login', {
                error: 'Not a User, Sign Up first'
            });
        } else {
            let userData = {
                username: filteredUser[0].username,
                email: filteredUser[0].email,
                profileImgName: filteredUser[0].profileImgName,
                isAdmin: filteredUser[0].isAdmin
            }
            jwt.sign(userData, jwt_secret, { expiresIn: '20m' }, (err, token) => {
                res.cookie('cookieToken', token, { httpOnly: true, maxAge: 21600000, sameSite: 'lax' });
                res.redirect('/');
            });
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
                return user.email === email && user.password === password;
            });
            if (filteredUser.length) {
                res.render('accounts/signup', {
                    error: 'User Already Exists, Please LogIn'
                });
            } else {
                let obj = {
                    username: username,
                    email: email,
                    password: password,
                    profileImgName: profileImgName,
                    isVerified: false,
                    verificationKey: uuidv4(),
                    isAdmin: false
                }
                users.push(obj);
                let userData = {
                    username: username,
                    email: email
                }
                jwt.sign(userData, jwt_secret, { expiresIn: '20m' }, (err, token) => {
                    if (err) {
                        console.log('Error', err);
                    } else {
                        updateUsersToFile(JSON.stringify(users), function (err) {
                            if (err) {
                                res.render('/signup', {
                                    error: 'Error while Signing you in, Please try again.'
                                });
                            } else {
                                res.cookie('cookieToken', token, { httpOnly: true, maxAge: 21600000, sameSite: 'lax' });
                                res.send(`
                                        <font style="font-weight: 600; font-size: 18px;">Your Account is not Verified Yet, <a href="/verifyUser?username=${obj.username}&email=${obj.email}&verificationKey=${obj.verificationKey}">Click Here to Verify</a></font>
                                `);
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.render('/signup', {
            error: `Password doesn't match`
        });
    }
});

app.get("/user/verify_account", function (req, res) {
    let verificationKey = req.query.verification_key;
    readUsersFromFile(function (users) {
        updateVerifiedStatus(users, verificationKey, (updatedUsers) => {
            updateUsersToFile(JSON.stringify(updatedUsers), (err) => {
                if (err) {
                    console.log('Error' + err);
                } else {
                    console.log('User successfully verified');
                    res.redirect('/');
                }
            });
        });
    });
});

function updateVerifiedStatus(users, verificationKey, callback) {
    users.forEach(user => {
        if (user.verificationKey === verificationKey) {
            user.isVerified = true;
        }
    });
    setTimeout(() => {
        callback(users)
    }, 1000);
}

app.get('/verifyUser', (req, res) => {
    const user = {
        username: req.query.username,
        email: req.query.email,
        verificationKey: req.query.verificationKey
    }
    readUsersFromFile(function (users) {
        users.forEach(element => {
            if (user.email === element.email && element.isVerified) {
                res.redirect('/');
            } else {
                verifyUserThroughMail(user);
                res.status(200).render('accounts/verify');
            }
        });
    });
});

app.get('/user/dashboard', (req, res) => {
    jwt.verify(req.cookies.cookieToken, jwt_secret, (err, decoded) => {
        if (err) {
            res.render('index.ejs');
        } else {
            readUsersFromFile((users) => {
                users.forEach(user => {
                    if (user.email === decoded.email) {
                        res.render('users/dashboard.ejs', {
                            username: user.username,
                            email: user.email,
                            profileImgName: user.profileImgName
                        });
                    }
                });
            });
        }
    });
});

app.post('/user/change_password', (req, res) => {
    const email = req.body.email;
    const newPassword = req.body.password;
    readUsersFromFile((users) => {
        users.forEach(user => {
            if (user.email === email) {
                user.password = newPassword;
            }
        });
        updateUsersToFile(JSON.stringify(users), (err) => {
            if (err) {
                res.json({
                    status: false
                });
            } else {
                res.json({
                    status: true
                });
            }
        });
    });
});

app.get('/user/cart', (req, res) => {
    jwt.verify(req.cookies.cookieToken, jwt_secret, (err, decoded) => {
        if (err) {
            res.render('accounts/login', {
                error: "To view cart Items first signIn"
            });
        } else {
            readUsersFromFile((users) => {
                users.forEach(user => {
                    if (user.email === decoded.email) {
                        readProductsFromFile((product) => {
                            readCartItemsFromFile((cart) => {
                                res.render('users/cart.ejs', {
                                    username: user.username,
                                    email: user.email,
                                    profileImgName: user.profileImgName,
                                    products: product,
                                    cartItems: cart,
                                    logout: true
                                });
                            });
                        });
                    }
                });
            });
        }
    });
});

app.post('/add_to_cart', (req, res) => {
    const productId = req.body.productId;
    readCartItemsFromFile((cart) => {
        cart[productId] = true;
        console.log(cart, 'shivam');
        updateCartItemsToFile(JSON.stringify(cart), (err) => {
            if (err) {
                res.json({
                    status: false,
                    message: 'Some Issue Occured while adding your product to cart.'
                });
            } else {
                res.redirect('/');
            }
        });
    });
});

app.post('/user/cart/remove_item', (req, res) => {
    const productId = req.body.productId;
    console.log(productId);
    readCartItemsFromFile((cart) => {
        if (cart[productId]) {
            delete cart[productId];
            updateCartItemsToFile(JSON.stringify(cart), (err) => {
                res.redirect('/user/cart');
            });
        } else {
            res.json({
                status: false
            });
        }
    });
});

app.get('/cart_items', (req, res) => {
    jwt.verify(req.cookies.cookieToken, jwt_secret, (err, decoded) => {
        if (err) {
            res.render('accounts/login', {
                error: "To view cart Items first signIn"
            });
        } else {
            readCartItemsFromFile((cart) => {
                res.json({
                    cartItems: cart
                });
            });
        }
    });
});

app.get('/all_products', (req, res) => {
    readProductsFromFile(fileData => {
        if (fileData.length === 0) {
            res.end('No Products to Show');
        }
        res.send(JSON.stringify(fileData));
    });
});

app.get('/loadMore', (req, res) => {
    readProductsFromFile(fileData => {
        if (fileData.length === 0) {
            res.end('No Products to Show');
        }
        res.send(JSON.stringify(fileData));
    });
});

// ADMIN ROUTES

// middleware to check the admin is Login or not
app.use('/admin', (req, res, next) => {
    if (!Object.keys(req.profile).length && req.path !== '/login') {
        res.redirect('/login');
        return;
    }
    next();
});

app.get('/admin', (req, res) => {
    readProductsFromFile((products) => {
        const product = [];
        productEnd = 5;
        for (let i = productStart; i < productEnd; ++i) {
            product.push(products[i]);
        }
        const user = req.profile;
        res.render('admin/home.ejs', {
            username: user.username.split(' ')[0],
            email: user.email,
            isAdmin: user.isAdmin,
            profileImgName: user.profileImgName,
            products: product,
            logout: true
        });
    });
});

app.get('/admin/dashboard', (req, res) => {
    const user = req.profile;
    res.render('admin/dashboard.ejs', {
        username: user.username,
        email: user.email,
        profileImgName: user.profileImgName
    });
});

app.post('/admin/add_products', (req, res) => {
    const productData = {
        title: req.body.productName,
        price: Number(req.body.productPrice),
        description: req.body.productDescription,
        stock: Number(req.body.productInStock),
        src: req.body.productImgValue,
    }
    console.log(productData);
    readProductsFromFile((fileData) => {
        productData.id = Number(Date.now().toString());
        fileData.push(productData);
        updateProductInFile(JSON.stringify(fileData), (err) => {
            if (err) {
                res.json({
                    status: false
                });
            } else {
                res.json({
                    status: true
                });
            }
        });
    });
});

app.post('/admin/delete_product', (req, res) => {
    const productData = {
        id: req.body.productId
    }
    readProductsFromFile((fileData) => {
        filteredProducts(fileData, productData, (filtered) => {
            updateProductInFile(JSON.stringify(filtered), (err) => {
                if (err) {
                    res.json({
                        status: false
                    });
                } else {
                    res.json({
                        status: true,
                        message: 'Item Successfully Deleted'
                    });
                }
            });
        });
    });
});

app.post('/admin/update_product', (req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const stock = req.body.stock;
    const src = req.body.src;
    const productObj = {
        id: Number(id),
        title: title,
        price: price,
        description: description,
        stock: stock,
        src: src
    }

    readProductsFromFile((fileData) => {
        newProducts(fileData, productObj, (products) => {
            products.splice(0, 0, productObj);
            updateProductInFile(JSON.stringify(products), (err) => {
                if (err) {
                    res.end(JSON.stringify({
                        status: false
                    }));
                } else {
                    res.end(JSON.stringify({
                        status: true,
                        message: 'Item Successfully Updated'
                    }));
                }
            });
        });
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('cookieToken');
    res.redirect('/');
});

function newProducts(fileData, productObj, callback) {
    const products = fileData.filter((product) => {
        return (product.id !== productObj.id)
    });
    setTimeout(() => {
        callback(products)
    }, 2000);
}

function filterUser(decoded, callback) {
    readUsersFromFile((users) => {
        const filteredUser = users.find(user => {
            return user.email === decoded.email;
        });
        setTimeout(() => {
            callback(filteredUser)
        }, 1000);
    });
}

function userPasswordReset(user) {
    console.log(user, "shivam");
    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "sshivamsingh440@gmail.com",
                        "Name": "Shivam"
                    },
                    "To": [
                        {
                            "Email": user.email,
                            "Name": user.username
                        }
                    ],
                    "Subject": "Greetings from Iron Kingdom.",
                    "TextPart": "My first Mailjet email",
                    "HTMLPart": `<h3>Dear ${user.username}, Your request for password reset has been considered, <a href="http://localhost:5000/user/password_reset_request?verification_key=${user.verificationKey}">Click here to proceed</a>!</h3><br />May the delivery force be with you!`,
                    "CustomID": "AppGettingStartedTest"
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        });
}

function verifyUserThroughMail(user) {
    console.log(user);
    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "sshivamsingh440@gmail.com",
                        "Name": "Shivam"
                    },
                    "To": [
                        {
                            "Email": user.email,
                            "Name": user.username
                        }
                    ],
                    "Subject": "Greetings from Iron Kingdom.",
                    "TextPart": "My first Mailjet email",
                    "HTMLPart": `<h3>Dear ${user.username}, Welcome to Iron Kingdom <a href="http://localhost:5000/user/verify_account?verification_key=${user.verificationKey}">Verify your account</a>!</h3><br />May the delivery force be with you!`,
                    "CustomID": "AppGettingStartedTest"
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
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

function filteredProducts(fileData, productData, callback) {
    const filteredProducts = fileData.filter(product => {
        return product.id !== productData.id;
    });
    setTimeout(() => callback(filteredProducts), 1000);
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

function updateProductInFile(fileData, callback) {
    fs.writeFile('./products.txt', fileData, (err) => {
        callback(err);
    });
}

function readCartItemsFromFile(callback) {
    fs.readFile('./cart.txt', 'utf-8', (err, fileData) => {
        fileData = fileData.length ? JSON.parse(fileData) : {};
        callback(fileData);
    });
}

function updateCartItemsToFile(fileData, callback) {
    fs.writeFile('./cart.txt', fileData, (err) => {
        callback(err);
    });
}

app.listen(port, (err) => {
    console.log(`App is Listening http://localhost:${port}`);
});