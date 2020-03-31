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
    var imagesNames = [];
    if(req.files.images){
        const file = req.files.images;
        for(let i = 0 ; i < file.length; i++){
            imagesNames[i] = file[i].name;
            file[i].mv('./public/images/'+file[i].name, function (err){
                if(err){
                    res.send(err);
                }
            })
        }
        console.log("images uploaded successfully");
    };
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
    let id=req.body.property_id;
    Property.findOne({_id:id}).exec(function(err,property){
        property.rentalname=rentalname;
        property.description=description;
        property.price=price;
        property.address=address;
        property.city=city;
        property.state=state;
        property.country=country;
        property.area= area;
        property.rooms=rooms;
        property.baths=baths;
        property.beds=beds;
        property.amenities=amenities;
        property.rules=rules;
        property.createdOn= new Date(Date.now()).toISOString();
        property.save()
            .then(() => {
                req.flash('successMsg', 'Property updated successfully!');
            })
            .catch(() => {
                req.flash('errorMsg', 'Something went wrong while editing Property!');
                res.redirect('/owner-dashboard');
            });
    });
    if(req.session.role==='owner')
    {
        res.redirect('/owner-dashboard');
    }
    else
    {
        res.redirect('/admin-dashboard');
    }
};

//Delete Property
const deleteProperty = (req, res, Property) => {
    var id = req.params.id;
        Property.findByIdAndDelete({_id: id}).exec(function (err) {
            if (err) {
                req.flash('errorMsg', 'Something went wrong while deleting Property!');
                if(req.session.role==='owner')
                {
                    res.redirect('/owner-dashboard');
                }
                else
                {
                    res.redirect('/admin-dashboard');
                }
            } else {
                req.flash('successMsg', 'Property deleted successfully!');
                if(req.session.role==='owner')
                {
                    res.redirect('/owner-dashboard');
                }
                else
                {
                    res.redirect('/admin-dashboard');
                }
            }
        });
};

module.exports = {
    createProperty,
    updateProperty,
    deleteProperty,
};
