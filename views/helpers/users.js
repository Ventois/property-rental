// All the methods related to user management

// Authenticate User
const authenticateUser = (req, res, Users) => {
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
};

//Logout User
const logoutUser = (req, res, Users) => {
    if (req.session.userLoggedIn) {
        req.session.destroy();
        Header.findOne({type: 'header'}).exec(function (err, header) {
            res.render('logout', {header: header})
        });
    }
};

// Create User
const createUser = (req, res, Users) => {
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
};

// Update User
const updateUser = (req, res, Users) => {
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
};

//Delete User
const deleteUser = (req, res, Users) => {
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
};

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    authenticateUser,
    logoutUser
};
