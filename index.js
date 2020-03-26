const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/spm', {
    useNewUrlParser: true
});
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('req-flash');
const {USER_SCHEMA, PROPERTY_SCHEMA} = require('./views/helpers/schemas');
const Users = mongoose.model('User', USER_SCHEMA);
const Property = mongoose.model('Propertie', PROPERTY_SCHEMA);
const {EMPTY_USER} = require("./views/helpers/constants");
const {createUser, updateUser, deleteUser, authenticateUser, logoutUser} = require("./views/helpers/users");
const {createProperty, updateProperty, deleteProperty,} = require("./views/helpers/properties");

var myApp = express();

myApp.use(bodyParser.urlencoded({extended: false}));
myApp.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: false,
    }
}));
myApp.use(flash());
myApp.use(bodyParser.json());
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

myApp.get('/property-details/:id', function (req, res) {
    console.log("inside  properyid : "+req.params.id);
   // if (req.session.userLoggedIn) {
        var id = req.params.id;
        console.log("id="+id);
        Property.find({_id: id}).exec(function (err, property_details) {
            console.log("found properyid : "+property_details);
            if(property_details.length > 0)
            {
                console.log("rendering properyid : "+property_details.length);
            res.render('property-details', {PropertyDetails: property_details[0]});
            }
        });
    // } else {
    //     res.redirect('/login');
    // }
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
    res.render('SignUp', {
        successMsg: req.flash('successMsg'),
        errorMsg: req.flash('errorMsg'),
    })
});
myApp.get('/add-property', function (req, res) {
    res.render('add-property', {
        successMsg: req.flash('successMsg'),
        errorMsg: req.flash('errorMsg'),
    })
});
myApp.get('/login', function (req, res) {
    res.render('login', {
        successMsg: req.flash('successMsg'),
        errorMsg: req.flash('errorMsg'),
    })
});
// Creating user GET
myApp.get('/new-user', function (req, res) {
    res.render('edit-user', {action: 'new', user: EMPTY_USER, postAction: "/signup"})
});
myApp.post('/signup', function (req, res) {
    if (req.body.password !== req.body.confirmpassword && req.body.action !== "new") {
        res.render('signup',  {errorMsg: "Your password and Confirm password are not same"});
    } else {
        createUser(req, res, Users);
    }
});
myApp.post('/login', function (req, res) {
    authenticateUser(req, res, Users)
});

myApp.get('/user-dashboard', function (req, res) {
    if (req.session.userLoggedIn) {
        Property.find({}).exec(function (err, properties) {
            Users.findOne({_id: req.session.userid}).exec(function (err, user) {
                res.render('user-dashboard', {
                    successMsg: req.flash('successMsg'),
                    errorMsg: req.flash('errorMsg'),
                    properties: properties,
                    user: user,
                    session: req.session
                });
            });
        });
    } else {
        res.redirect('/login');
    }
});

myApp.get('/owner-dashboard', function (req, res) {
    if (req.session.userLoggedIn) {
        Property.find({}).exec(function (err, properties) {
            Users.findOne({_id: req.session.userid}).exec(function (err, owner) {
                res.render('owner-dashboard', {
                    successMsg: req.flash('successMsg'),
                    errorMsg: req.flash('errorMsg'),
                    properties: properties,
                    owner: owner,
                    session: req.session
                });
            });
        });
    } else {
        res.redirect('/login');
    }
});

myApp.get('/admin-dashboard', function (req, res) {
    if (req.session.userLoggedIn) {
        Users.find({}).exec(function (err, users) {
            res.render('admin-dashboard',
                {
                    successMsg: req.flash('successMsg'),
                    errorMsg: req.flash('errorMsg'),
                    users: users,
                    session: req.session
                })
        });
    } else {
        res.render('login')
    }
});
// Delete User / property
myApp.get('/delete/:type/:id', function (req, res) {
    var type = req.params.type;
    if(type === "user") {
        deleteUser(req, res, Users)
    }
    if(type === "property") {
        deleteProperty(req, res, Property)
    }

});
myApp.post('/add-property', function (req, res) {
    console.log(req.session.userid);
    createProperty(req, res, Property)
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
    updateUser(req, res, Users)
});
myApp.get('/logout', function (req, res) {
    logoutUser(req, res)
});

//Search The Property Based on following 3 Queries
//1.Location 
myApp.post('/property-list', function (req, res) {
    let location = req.body.location;
    console.log("Searching Properties for location/hotel :" +location);
    // var items = Property.find({city: location},function(err,result){
    //     if (err)
    //         console.log('error occured in the database');
    //         console.log("Results found :");
    //     console.log(result);
    //     res.render('property-list',{
    //         PropertyList : result           
    //     });

var locationWithExpr = { $regex : new RegExp(location, "i") };
        var items = Property.find({ $or: [
            {
                
            city: locationWithExpr
        },
        {
            address: locationWithExpr
        },
        {
            state: locationWithExpr
        },
        {
            country: locationWithExpr
        },
        {
            rentalname: locationWithExpr
        }]}
        ,function(err,result){
            if (err)
                console.log('error occured in the database');
                console.log("Results found :");
            console.log(result);
            res.render('property-list',{
                PropertyList : result           
            });
       
    //console.log(items.model.Property);
    //.fetch();//function(err, result) {
        //if (err) throw err;
        //items.forEach(element => {
       //     console.log(element);
      //  });
        //db.close();
})
});
    //console.log(items);



//----------- Start the server -------------------

myApp.listen(8080);
console.log('Server started at 8080 for mywebsite...');
