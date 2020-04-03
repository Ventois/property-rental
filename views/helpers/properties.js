// All the methods related to property management
var fs = require('fs');
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
    var imagesNames = [];
    const file = req.files.images;
    for(let i = 0 ; i < file.length; i++)
    {
        let ext ="."+file[i].name.split('.').pop();
        imagesNames[i] = (i+1)+ext;//file[i].name;
    }
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
        images: imagesNames,
        owner: req.session.userid
    });
    newProperty.save()
        .then(() => {
            let propertyId = newProperty._id;
            console.log("Added Property :"+propertyId+" , Now uploading images for rental");
            if(file){
                //const file = req.files.images;
                for(let i = 0 ; i < file.length; i++){
                    //imagesNames[i] = file[i].name;
                    let path = './public/images/'+propertyId+'/';
                    if (!fs.existsSync(path)){
                        fs.mkdirSync(path);
                    }
                    let ext ="."+file[i].name.split('.').pop();
                    file[i].mv(path + (i+1)+ext, function (err){
                        if(err){
                            res.send(err);
                        }
                    })
                }
                console.log("images uploaded successfully");
            };

            req.flash('successMsg', 'Property Added successfully!');
            if(req.session.role==="owner"){
                res.redirect('/owner-dashboard');
            }
            else{
                 res.redirect('/admin-dashboard');
            }

        })
        .catch(() => {
            req.flash('errorMsg', 'Something went wrong while adding property!');
            if(req.session.role==="owner"){
                res.redirect('/owner-dashboard');
            }
            else{
                 res.redirect('/admin-dashboard');
            }
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
