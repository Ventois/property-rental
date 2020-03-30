const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/spm', {
    useNewUrlParser: true
});
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('req-flash');
const {USER_SCHEMA, PROPERTY_SCHEMA, BOOKING_SCHEMA} = require('./views/helpers/schemas');
const Users = mongoose.model('User', USER_SCHEMA);
const Property = mongoose.model('Propertie', PROPERTY_SCHEMA);
const Booking = mongoose.model('Booking', BOOKING_SCHEMA);
const {EMPTY_USER} = require("./views/helpers/constants");
const {createUser, updateUser, deleteUser, authenticateUser, logoutUser,updateUserProfile} = require("./views/helpers/users");
const {createProperty, updateProperty, deleteProperty,} = require("./views/helpers/properties");
const {bookProperty, deleteBooking} = require("./views/helpers/bookings");

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
myApp.use(function(req, res, next) {
    res.locals.firstname = req.session.firstname;
    res.locals.userid = req.session._id;
    res.locals.emailid = req.session.email;
    res.locals.userLoggedIn = req.session.userLoggedIn;
    next();
});
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
    console.log("user pref : "+req.session.UserPreference.Location);
    //console.log("dproperty :"+PropertyList);
    //console.log("inside  properyid : "+req.params.id);
    // if (req.session.userLoggedIn) {
    var id = req.params.id;
    console.log("id="+id);
    Property.find({_id: id}).exec(function (err, property_details) {
        // console.log("found properyid : "+property_details);
        if(property_details.length > 0)
        {
            //console.log("rendering properyid : "+property_details.length);
            res.render('property-details', {
                PropertyDetails: property_details[0],
                UserPreference : req.session.UserPreference
            });
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

// myApp.get('/user-dashboard', function (req, res) {
//     res.render('user-dashboard');
// });

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
    else if(type === "property") {
        deleteProperty(req, res, Property)
    }
    else if(type === "booking") {
        deleteBooking(req, res, Booking)
    }

});
myApp.post('/add-property', function (req, res) {
    console.log(req.session.userid);
    createProperty(req, res, Property)
});

// Editing user GET
myApp.get('/edit-user/:id', function (req, res) {
    if (req.session.userLoggedIn) {
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
    console.log(req.body.checkin_checkout_dates);
    var dates= req.body.checkin_checkout_dates.split(" - ");
    var finaldisplayDate = "\""+dates[0]+"\" - \""+dates[1]+"\"";
    var checkinDate = new Date(Date.parse(dates[0]));
    var checkoutDate = new Date(Date.parse(dates[1]));
    //Jul 1 / 2020", "Aug 25 / 2020
    var dispDate = "\""+dates[0].substring(0,3)+" "+checkinDate.getDate()+" / "+checkinDate.getFullYear()+"\"";
    dispDate += ", \""+  dates[1].substring(0,3)+" "+checkoutDate.getDate()+" / "+checkoutDate.getFullYear()+"\"";


    console.log("Searching Properties for location/hotel :" +location);
    // var items = Property.find({city: location},function(err,result){
    //     if (err)
    //         console.log('error occured in the database');
    //         console.log("Results found :");
    //     console.log(result);
    //     res.render('property-list',{
    //         PropertyList : result
    //     });

    let GuestsAndRooms = req.body.GuestsAndRooms;
    GuestsAndRooms = GuestsAndRooms.replace("Adult","");
    GuestsAndRooms = GuestsAndRooms.replace("Rooms","");
    GuestsAndRooms = GuestsAndRooms.trim();
    GuestsAndRooms = GuestsAndRooms.split(" - ");
    var guests = GuestsAndRooms[0];
    var rooms = GuestsAndRooms[1];
    var dates= req.body.checkin_checkout_dates.split(" - ");
    //var checkinDate = new Date(Date.parse(dates[0]));
    //var checkoutDate = new Date(Date.parse(dates[1]));
    var locationWithExpr = { $regex : new RegExp(location, "i") };
    var items = Property.find({ $and:[ { $or: [
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
                    }]

            },
                //And expression here
            ]
        }


        ,function(err,result){
            if (err)
                console.log('error occured in the database');
            console.log("Results found :");
            console.log(result);
            req.session.UserPreference = {
                Location : location,
                Rooms : rooms,
                Guests : guests,
                CheckInDate : dates[0],
                CheckOutDate : dates[1],
                DisplayDate : dispDate// req.body.checkin_checkout_dates//'["Jul 1 / 2020", "Aug 25 / 2020"]'//
            };
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
myApp.post('/BookProperty', function (req, res) {
    console.log('Book Property called with data: ');
    bookProperty(req, res, Booking)
});

// myApp.get('/BookingConfirmation', function (req, res) {
//     res.render("BookingConfirmation");
// });

myApp.post('/BookingConfirmation', function (req, res) {
    var dates= req.body.checkin_checkout_dates.split(" - ");


    var checkinDate = new Date(Date.parse(dates[0].replace("[","")));
    var checkoutDate = new Date(Date.parse(dates[1].replace("]","")));

    var GuestsAndRooms = req.body.txtRoomsAndGuests;
    GuestsAndRooms = GuestsAndRooms.replace("Guests","");
    GuestsAndRooms = GuestsAndRooms.replace("Rooms","");
    GuestsAndRooms = GuestsAndRooms.trim();
    GuestsAndRooms = GuestsAndRooms.split(" - ");
    var guests = GuestsAndRooms[1].trim();
    var rooms = GuestsAndRooms[0].trim();
    var bookingInfo = {
        PropertyID: req.body.property_id,
        //customer_id:  "501",//Later change to some session userid
        CheckInDate: checkinDate,
        CheckOutDate: checkoutDate,
        Guests: guests,
        Rooms: rooms
    };
    console.log('BookingConfirmation request reached: ');




    Property.find({_id: req.body.property_id},function (err, property) {
        // console.log("found properyid : "+property_details);
        if(property.length > 0)
        {
            var propertyInfo = property[0];
            bookingInfo['PropertyName'] = propertyInfo.rentalname;
            bookingInfo['PropertyAddress'] = propertyInfo.address;

            bookingInfo['PricePerNight'] = propertyInfo.price;

            var checkindate = Date.parse(checkinDate);
            var checkoutdate = Date.parse(checkoutDate);
            var totalNights = Math.round((checkoutdate-checkindate)/(1000*60*60*24));
            bookingInfo['TotalNights'] = totalNights;
            bookingInfo['TotalPrice'] = totalNights * Number(propertyInfo.price) * Number(rooms);
            bookingInfo['CustomerEmailID'] = req.session.email;
            bookingInfo['DisplayCheckInDate'] = dates[0].replace("[","");
            bookingInfo['DisplayCheckOutDate'] = dates[1].replace("]","");
            bookingInfo['CustomerID'] = req.session.userid;
            res.render('BookingConfirmation', {
                BookingInfo: bookingInfo
            });
        }
    });
});

myApp.get('/user-dashboard', function (req, res) {
    if (req.session.userLoggedIn) {
        // Property.find({}).exec(function (err, properties) {
        //     Users.findOne({_id: req.session.userid}).exec(function (err, owner) {

        var staysList = [];
        var upcomingStaysList = [];
        var completedStaysList = [];
        var today = new Date();
        var userInfo = {};
//get the compete users info
        Users.findOne({_id: req.session.userid},(function (err, user) {
            userInfo = user;
            userInfo['UserCreatedOn'] = getFormattedDate(Date.parse(user.createdOn)) + " "+getFormattedTime(Date.parse(user.createdOn));
        }));
        Booking.find({customer_id: req.session.userid}).exec(function (err, bookings) {

                if(bookings.length > 0)
                {
                    var totalDocsCount =  bookings.length;
                    var tempDocsCount =0;
                    bookings.forEach(booking => {
                        Property.findOne({_id: booking.property_id}).exec(function (err, property) {
                                tempDocsCount++;
                                var stay = {
                                    PropertyID : property._id,
                                    PropertyAddress : property.address,
                                    BookingID : booking._id,
                                    PropertyName : property.rentalname,
                                    CheckInDate : getFormattedDate(Date.parse(booking.checkinDate)),
                                    CheckOutDate : getFormattedDate(Date.parse(booking.checkoutDate)),
                                    Guests : booking.guests,
                                    Rooms : booking.rooms,
                                    TotalPrice : booking.totalPrice,
                                    TotalNights : booking.totalNights,
                                    BookingDate : getFormattedDate(Date.parse(booking.bookingDate)) + " "+getFormattedTime(Date.parse(booking.bookingDate))
                                };
                                staysList.push(stay);
                                if(new Date(Date.parse(booking.checkinDate)) < today)
                                {
                                    completedStaysList.push(stay);
                                }
                                else if(new Date(Date.parse(booking.checkinDate)) > today)
                                {
                                    upcomingStaysList.push(stay);
                                }
                                if(tempDocsCount == totalDocsCount)
                                {
                                    res.render('user-dashboard', {
                                        stays: staysList,
                                        upcomingStays : upcomingStaysList,
                                        completedStays : completedStaysList,
                                        userInfo : userInfo,
                                        successMsg: req.flash('successMsg'),
                                        errorMsg: req.flash('errorMsg'),
                                    });
                                }
                            }
                        )
                    });

                }
                else
                {
                    res.render('user-dashboard', {
                        stays: {},
                        upcomingStays : {},
                        completedStays :{},
                        userInfo : userInfo,
                        successMsg: req.flash('successMsg'),
                        errorMsg: req.flash('errorMsg'),
                    });
                }
            }
        );


    } else {
        res.redirect('/login');
    }
});
function getFormattedDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;


    return [ day,month,year].join('-');
}

function getFormattedTime(d)
{
    var date = new Date(d);
    return  date.getHours().toString().padStart(2, '0') + ':' +
        date.getMinutes().toString().padStart(2, '0') + ':' +
        date.getSeconds().toString().padStart(2, '0');
}
//----------- Start the server -------------------

myApp.get('/BookedPropertyDetails/:id', function (req, res) {
    //console.log("user pref : "+req.session.UserPreference.Location);
    //console.log("dproperty :"+PropertyList);
    //console.log("inside  properyid : "+req.params.id);
    // if (req.session.userLoggedIn) {
    var id = req.params.id;
    console.log("id="+id);
    Property.findOne({_id: id}).exec(function (err, property_details) {
        // console.log("found properyid : "+property_details);
        if(property_details)
        {
            //console.log("rendering properyid : "+property_details.length);
            res.render('BookedPropertyDetails', {
                PropertyDetails: property_details
            });
        }
    });
    // } else {
    //     res.redirect('/login');
    // }
});

myApp.get('/new-user-profile', function (req, res) {
    res.render('edit-user', {action: 'new', user: EMPTY_USER, postAction: "/signup"})
});

myApp.get('/edit-user-profile/:id', function (req, res) {
    if (req.session.userLoggedIn) {
        var id = req.params.id;
        Users.findOne({_id: id}).exec(function (err, user) {
            res.render('edit-user-profile', {user: user, action: "edit", postAction: "/edit-user-profile"})
        });
    } else {
        res.redirect('/login');
    }
});

//----------- Start the server -------------------

myApp.post('/edit-user-profile', function (req, res) {
    updateUserProfile(req, res, Users)
});

//----------- Start the server -------------------

myApp.listen(8080);
console.log('Server started at 8080 for mywebsite...');
