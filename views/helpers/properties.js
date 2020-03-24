// All the methods related to property management

// Create Property
const createProperty = (req, res, Property) => {
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
        createdOn: new Date(Date.now()).toISOString(),
        owner: req.session.userid
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
};
// Update Property
const updateProperty = (req, res, Property) => {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var phone = req.body.phone;
    var email = req.body.email;
    var role = req.body.role === "On" ? "owner" : "user";
    var id = req.body.userid;
    Property.findOne({_id: id}).exec(function (err, user) {
        user.firstname = firstname;
        user.lastname = lastname;
        user.phone = phone;
        user.email = email;
        user.role = role;
        user.updatedOn = new Date(Date.now()).toISOString();
        user.save()
            .then(() => {
                req.flash('successMsg', 'Property updated successfully!');
                res.redirect('/owner-dashboard');
            })
            .catch(() => {
                req.flash('errorMsg', 'Something went wrong while editing Property!');
                res.redirect('/owner-dashboard');
            });
    });
};

//Delete Property
const deleteProperty = (req, res, Property) => {
    var id = req.params.id;
        Property.findByIdAndDelete({_id: id}).exec(function (err) {
            if (err) {
                req.flash('errorMsg', 'Something went wrong while deleting Property!');
                res.redirect('/owner-dashboard');
            } else {
                req.flash('successMsg', 'Property deleted successfully!');
                res.redirect('/owner-dashboard');
            }
        });
};

module.exports = {
    createProperty,
    updateProperty,
    deleteProperty,
};
