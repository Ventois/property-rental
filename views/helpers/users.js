const bcrypt = require('bcryptjs');

// All the methods related to user management

// Authenticate User
const authenticateUser = (req, res, Users) => {
    var email = req.body.email;
    var password = req.body.password;
    Users.findOne({email:email}).exec(function (err, signup) {
        if(!signup) {
            req.flash('errorMsg', 'Your email/password is wrong');
            res.redirect('/login')
        } else {
            bcrypt.compare(password, signup.password, function(error, result) {
                if(result) {
                    req.session.email = signup.email;
                    req.session.role = signup.role;
                    req.session.userid = signup._id;
                    req.session.userLoggedIn = true;
                    var role = signup.role;
                    if (role === 'user') {
                        res.redirect('/user-dashboard');
                    } else if (role === 'owner') {
                        res.redirect('/owner-dashboard');
                    } else {
                        res.redirect('/admin-dashboard');
                    }
                } else {
                    console.log("login failed");
                    req.flash('errorMsg', 'Your email/password is wrong');
                    res.redirect('/login')
                }
            });
        }
    });
};

//Logout User
const logoutUser = (req, res) => {
    if (req.session.userLoggedIn) {
        req.session.destroy();
        req.flash('successMsg', 'You have successfully logged out.');
        res.redirect('/login');
    }
};

// Create User
const createUser = async (req, res, Users) => {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var phone = req.body.phone;
    var email = req.body.email;
    var role = req.body.HaveProperty === "owner" ? "owner" : "user";
    var action = req.body.action;
    const hash = await hashPassword(req.body.password);
    var SignUpMember = new Users({
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        email: email,
        password: hash,
        role: role,
        createdOn: new Date(Date.now()).toISOString(),
        updatedOn: new Date(Date.now()).toISOString(),
    });
    SignUpMember.save()
        .then(() => {
            if (action === "new") {
                req.flash('successMsg', 'User Added successfully!');
                res.redirect('/admin-dashboard');
            } else {
                req.flash('successMsg', 'You registration is successful. Please try logging here.');
                res.redirect('/login');
            }
        })
        .catch(() => {
            if (action === "new") {
                req.flash('errorMsg', 'Something went wrong while adding user!');
                res.redirect('/admin-dashboard');
            } else {
                req.flash('errorMsg', 'Something went wrong while we register you!. please try again');
                res.redirect('/signup');
            }

        });
};

// Update User
const updateUser = (req, res, Users) => {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var phone = req.body.phone;
    var email = req.body.email;
    var role = req.body.role === "owner" ? "owner" : "user";
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
        Users.findByIdAndDelete({_id: id}).exec(function (err) {
            if (err) {
                req.flash('errorMsg', 'Something went wrong while deleting user!');
                res.redirect('/admin-dashboard');
            } else {
                req.flash('successMsg', 'User deleted successfully!');
                res.redirect('/admin-dashboard');
            }
        });
};

//Hash User Password
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt)
    } catch(error) {
        throw new Error('Hashing failed', error)
    }
};
//Compare User Password
//Hash User Password
const comparePassword = async (password, dbHash) => {
    bcrypt.compare(password, dbHash, function(err, result) {
        if (err) {
            console.log(err);
        }
        else if (result) {
            console.log("password match");
        }
        else {
            console.log("not match");
        }
    });
};
module.exports = {
    createUser,
    updateUser,
    deleteUser,
    authenticateUser,
    logoutUser,
    hashPassword,
    comparePassword
};
