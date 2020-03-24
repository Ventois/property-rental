const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/spm', {
    useNewUrlParser: true
});

var reSlugChar = /^[a-z]{1,}$/;
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('req-flash');

const Users = mongoose.model('User', {
    firstname: String,
    lastname: String,
    phone: String,
    email: String,
    password: String,
    role: String,
    createdOn: Date,
    updatedOn: Date
});

const Property = mongoose.model('Propertie', {
    rentalname: String,
    description: String,
    price: String,
    address: String,
    city: String,
    state: String,
    country: String,
    area: Number,
    rooms: Number,
    baths: Number,
    beds: Number,
    amenities: Array,
    rules: Array,
    createdOn: Date
});

const userInit = {
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    role: ""
};

var myApp = express();

myApp.use(bodyParser.urlencoded({extended: false}));
myApp.use(session({
    secret: "randomsecret",
    resave: false,
    saveUninitialized: true
}));
myApp.use(flash());
myApp.use(bodyParser.json())
myApp.use(fileUpload());

myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

//---------------- Routes ------------------

myApp.get('/', function (req, res) {
    res.render('index');
});

myApp.get('/about-us', function (req, res) {
    res.render('about');
});

myApp.get('/property-list', function (req, res) {
    res.render('property-list');
});

myApp.get('/property-details', function (req, res) {
    res.render('property-details');
});

myApp.get('/property-details/:id', function (req, res) {
    if (req.session.userLoggedIn) {
        var id = req.params.id;
        Property.find({_id: id}).exec(function (err, property_details) {
            res.render('property-details', {property_details: property_details});
        });
    } else {
        res.redirect('/login');
    }
});

myApp.get('/reservation', function (req, res) {
    res.render('booking');
});
myApp.get('/payment', function (req, res) {
    res.render('payment');
});
myApp.get('/confirmation', function (req, res) {
    res.render('confirmation');
});
myApp.get('/signup', function (req, res) {
    res.render('SignUp')
});
myApp.get('/add-property', function (req, res) {
    res.render('add-property')
});
myApp.get('/login', function (req, res) {
    res.render('login')
});
// Creating user GET
myApp.get('/new-user', function (req, res) {
    res.render('edit-user', {action: 'new', user: userInit, postAction: "/signup"})
});
myApp.post('/signup', [
    check('firstname', 'Please enter first name').not().isEmpty(),
    check('lastname', 'Please enter first name').not().isEmpty(),
    check('lastname', 'Please enter first name').not().isEmpty(),
    check('lastname', 'Please enter first name').not().isEmpty()
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorsData = {
            errors: errors.array(),
        }
        res.render('SignUp', errorsData);
    } else {
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var phone = req.body.phone;
        var email = req.body.email;
        var password = req.body.password;
        var role = req.body.HaveProperty === "On" ? "owner" : "user";
        var action =req.body.action;
        var SignUpMember = new Users({
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            email: email,
            password: password,
            role: role,
            createdOn: new Date(Date.now()).toISOString(),
            updatedOn: new Date(Date.now()).toISOString(),
        });
        SignUpMember.save()
            .then(() => {console.log("user added");})
            .catch(() => {console.log("something went wrong");});
        if(action === "new") {
            req.flash('successMsg', 'User Added successfully!');
            res.redirect('/admin-dashboard');
        } else {
            req.flash('errorMsg', 'Something went wrong while adding user!');
            res.redirect('/login');
        }

    }
});
myApp.post('/signin', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    Users.findOne({email: email, password: password}).exec(function (err, signup) {
        req.session.email = signup.email;
        req.session.role = signup.role;
        req.session.id = signup._id;
        console.log(req.session.id);
        req.session.userLoggedIn = true;
        var role = signup.role;
        if (role === 'user') {
            res.redirect('/userdashboard');
        } else if (role === 'owner') {
            res.redirect('/owner-dashboard');
        } else {
            res.redirect('/admin-dashboard');
        }
    });
});

myApp.get('/userdashboard', function (req, res) {
    res.render('UserDashboard');
});

myApp.get('/owner-dashboard', function (req, res) {
    if (!req.session.userLoggedIn) {
        Property.find({}).exec(function (err, properties) {
            Users.findOne({_id: req.session.id}).exec(function (err, owner) {
                res.render('owner-dashboard', {
                    successMsg: req.flash('successMsg'),
                    errorMsg: req.flash('errorMsg'),
                    properties: properties,
                    owner: owner
                });
            });
        });
    } else {
        res.redirect('/login');
    }
});

myApp.get('/admin-dashboard', function (req, res) {

    if (!req.session.userLoggedIn) {
        Users.find({}).exec(function (err, users) {
            res.render('admin-dashboard',
                {
                    successMsg: req.flash('successMsg'),
                    errorMsg: req.flash('errorMsg'),
                    users: users
                })
        });
    } else {
        res.render('login')
    }
});
// Delete User / property
myApp.get('/delete/:type/:id', function (req, res) {
    var id = req.params.id;
    var type = req.params.type;
    if (type === "user") {
        Users.findByIdAndDelete({_id: id}).exec(function (err) {
            if (err) {
                req.flash('errorMsg', 'Something went wrong while deleting user!');
                res.redirect('/admin-dashboard');
            } else {
                req.flash('successMsg', 'User deleted successfully!');
                res.redirect('/admin-dashboard');
            }
        });
    }
});
myApp.post('/add-property', function (req, res) {
    let rentalname = req.body.rentalname;
    let description = req.body.description;
    let price = req.body.price;
    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let country = req.body.country;
    let area = req.body.area;
    let rooms = req.body.rooms;
    let baths = req.body.baths;
    let beds = req.body.beds;
    let amenities = req.body.amenities;
    let rules = req.body.rules;
    let newProperty = new Property({
        rentalname: rentalname,
        description: description,
        price: price,
        address: address,
        city: city,
        state: state,
        country: country,
        area: area,
        rooms: rooms,
        baths: baths,
        beds: beds,
        amenities: amenities,
        rules: rules,
        createdOn: new Date(Date.now()).toISOString()
    });
    newProperty.save()
        .then(() => {
        req.flash('successMsg', 'Property Added successfully!');
        res.redirect('/owner-dashboard');
         })
        .catch(() => {
            req.flash('errorMsg', 'Something went wrong while adding property!');
            res.redirect('/owner-dashboard');
        });
});

// Editing user GET
myApp.get('/edit-user/:id', function (req, res) {
    if (!req.session.userLoggedIn) {
        var id = req.params.id;
        Users.findOne({_id: id}).exec(function (err, user) {
            res.render('edit-user', {user: user, action: "edit", postAction: "/edit-user"})
        });
    } else {
        res.redirect('/login');
    }
});
// Editing user POST
myApp.post('/edit-user', function (req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var phone = req.body.phone;
    var email = req.body.email;
    var role = req.body.role === "On" ? "owner" : "user";
    var id = req.body.userid;
    Users.findOne({_id: id}).exec(function (err, user) {
        user.firstname = firstname;
        user.lastname = lastname;
        user.phone = phone;
        user.email = email;
        user.role = role;
        user.updatedOn = new Date(Date.now()).toISOString();
        user.save()
            .then(() => {
                req.flash('successMsg', 'User updated successfully!');
                res.redirect('/admin-dashboard');
            })
            .catch(() => {
                req.flash('errorMsg', 'Something went wrong while editing user!');
                res.redirect('/admin-dashboard');
            });
    });
});
myApp.get('/logout', function (req, res) {
    if (req.session.userLoggedIn) {
        req.session.destroy();
        Header.findOne({type: 'header'}).exec(function (err, header) {
            res.render('logout', {header: header})
        });
    }
});


//----------- Start the server -------------------

myApp.listen(8080);
console.log('Server started at 8080 for mywebsite...');
