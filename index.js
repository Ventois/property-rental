const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/spm', {
    useNewUrlParser: true
});

var reSlugChar=/^[a-z]{1,}$/;
const fileUpload=require('express-fileupload');
const session=require('express-session');

const SignUp=mongoose.model('SignUp',{
    firstname:String,
    lastname:String,
    phone:String,
    email:String,
    password:String,
    role:String
});

var myApp = express();

myApp.use(bodyParser.urlencoded({ extended:false}));
myApp.use(session({
    secret:"randomsecret",
    resave:false,
    saveUninitialized:true
}));
myApp.use(bodyParser.json())
myApp.use(fileUpload());
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');

//---------------- Routes ------------------

myApp.get('/',function(req, res){
    res.render('index');
});

myApp.get('/about-us',function(req, res){
    res.render('about');
});

myApp.get('/property-list',function(req, res){
    res.render('property-list');
});

myApp.get('/property-details',function(req, res){
    res.render('property-details');
});

myApp.get('/reservation',function(req, res){
    res.render('booking');
});

myApp.get('/payment',function(req, res){
    res.render('payment');
});

myApp.get('/confirmation',function(req, res){
    res.render('confirmation');
});

myApp.get('/signup',function(req, res){
   res.render('SignUp')  
});

myApp.post('/signup',[
    check('firstname', 'Please enter first name').not().isEmpty(),  
    check('lastname', 'Please enter first name').not().isEmpty(),
    check('lastname', 'Please enter first name').not().isEmpty(),
    check('lastname', 'Please enter first name').not().isEmpty()
],function(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        var errorsData = {
            errors: errors.array(),
        }
       res.render('SignUp',errorsData);
    }
    else{
        var firstname = req.body.firstname;
        var lastname=req.body.lastname;
        var phone=req.body.phone;
        var email=req.body.email;
        var password=req.body.password;
        var role=req.body.HaveProperty=="On"?"owner":"user";
        var SignUpMember=new SignUp({
            firstname:firstname,
            lastname:lastname,
            phone:phone,
            email:email,
            password:password,
            role:role
        });

        SignUpMember.save().then(()=>{
            console.log('New member Sign Up successfully');
        });
        res.redirect('/');
    }
 });

const views={
    "owner":"/ownerdashboard",
    "user":'/userdashboard',
    "admin":'/admindashboard'
}
 myApp.get('/login',function(req, res){
    if(!(req.session.userLoggedIn))
    {
       res.render('login');
    }
    else
    {
        res.redirect(views[req.session.role]);
        // if(req.session.role=='owner')
        // {
        //     res.redirect('/ownerdashboard');
        // }
        // else if(req.session.role=='user')
        // {
        //     res.redirect('/userdashboard');
        // }
        // else
        // {
        //     res.redirect('/admindashboard');
        // } 
    } 
 });

 myApp.post('/signin',function(req, res){
    var email=req.body.email;
    var password=req.body.password;
    SignUp.findOne({email:email,password:password}).exec(function(err,signup){
        req.session.email=signup.email;
        req.session.password=signup.password;
        req.session.role=signup.role;
        req.session.userLoggedIn=true;
        var role=signup.role;
        if(role=='user')
        {
            res.redirect('/userdashboard');
        }
        else if(role=='owner')
        {
            res.redirect('/ownerdashboard');
        }
        else
        {
            res.redirect('/admindashboard');
        } 
    });
 });

 myApp.get('/userdashboard',function(req, res){
    res.render('UserDashboard');
});

myApp.get('/ownerdashboard',function(req, res){
    res.render('OwnerDashboard');
});

myApp.get('/admindashboard',function(req, res){
    res.render('AdminDashboard');
});

myApp.get('/contact',function(req, res){
    if(req.session.userLoggedIn)
    {    
        Header.findOne({type:'header'}).exec(function(err,header){
            res.render('addPage',{header:header})
        });
    }
    else
    {
        res.redirect('/login');
    }
});

myApp.post('/contact',[
    check('title', 'Please enter title').not().isEmpty(),
    check('slug', 'Please enter slug').not().isEmpty(),
    check('slug').custom((value, {req}) => {
        if(!(reSlugChar).test(value))
        {
            throw new Error('Slug should contain small alphabets only');
        }
        return true;
    }),
    check('message', 'Please enter message').not().isEmpty()
],function(req, res){
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()){
        var errorsData = {
            errors: errors.array(),
        }
        Header.findOne({type:'header'}).exec(function(err,header){
            res.render('addPage',{header:header})
        });
    }
    else{
        var title = req.body.title;
        var slug=req.body.slug;
        var imageName=req.files.myimage.name; // image name is saved
        var image=req.files.myimage // save file in temp buffer
        var imgpath='public/contact_images/'+imageName;
        var message=req.body.message;
        image.mv(imgpath,function(err){
            console.log(err);
        });
        
        var myAllPages = new Allpages({
            pagetitle: title,
            slug: slug,
            message: message,
            image:imageName
        });
        myAllPages.save().then(()=>{
            console.log('New Page added successfully');
        });
        var pageData = {
            // name: name,
            // phone: phone,
            // qty: qty,
            // cost: cost,
            // message: message
        };
        res.redirect('/allpages');
    }
});

// ------------ New Routes ---------------------

myApp.get('/login',function(req, res){
    if(!(req.session.userLoggedIn))
    {
        Header.findOne({type:'header'}).exec(function(err,header){
            res.render('login',{header:header})
        });
    }
    else
    {
        res.redirect('/allpages');
    }
});

myApp.post('/login',function(req, res){
    var username=req.body.username;
    var password=req.body.password;
    Admin.findOne({username:username,password:password}).exec(function(err,admins){
        req.session.username=admins.username;
        req.session.userLoggedIn=true;
        res.redirect('/allpages');
    });
});

myApp.get('/logout',function(req, res){
    if(req.session.userLoggedIn)
    {
        req.session.destroy();   
        Header.findOne({type:'header'}).exec(function(err,header){
            res.render('logout',{header:header})
        }); 
    }
});

myApp.get('/allpages',function(req, res){
    if(req.session.userLoggedIn)
    {
        Allpages.find({}).exec(function(err,pages){
            Header.findOne({type:'header'}).exec(function(err,header){
                res.render('allpages',{header:header,pages:pages})
            });  
        });
    }
    else
    {
        res.redirect('/login');
    }
});

myApp.get('/edit/:id',function(req, res){
    if(req.session.userLoggedIn)
    {     
        var id=req.params.id;
        //res.send(localname);
        Allpages.findOne({_id:id}).exec(function(err,page){
            Header.findOne({type:'header'}).exec(function(err,header){
                res.render('edit',{header:header,page:page})
            });
        });
    }
    else
    {
        res.redirect('/login');
    }
});

myApp.post('/edit/:id',function(req, res){
    //fetch all data to updated
    var id=req.params.id;
    var pagetitle = req.body.title;
    var imageName=req.files.myimage.name; // image name is saved
    var image=req.files.myimage // save file in temp buffer
    var imgpath='public/contact_images/'+imageName;
   
    if(imageName==''||imageName==null)
    {
        imageName='default_img.jpg';
        imgpath='public/contact_images/default_img.jpg';
    }
    image.mv(imgpath,function(err){
        console.log(err);
    });
    var slug = req.body.slug;
    var message = req.body.message;
    //fetch the page with the id from URL from the database
    Allpages.findOne({_id:id}).exec(function(err,page){
        // edit the fetch object from the database
        page.pagetitle=pagetitle;
        page.slug=slug;
        page.message=message;
        page.image=imageName;
        page.save().then( ()=>{
            console.log('page updated');
        });
    });
    res.redirect('/allpages');
});

myApp.get('/editHeader/header',function(req, res){
    if(req.session.userLoggedIn)
    {    
        Header.findOne({type:'header'}).exec(function(err,header){
            res.render('editHeader',{header:header})
        });
    }
    else
    {
        res.redirect('/login');
    }
});

myApp.post('/editHeader',function(req, res){
    //fetch all data to updated
    var id=req.params.id;
    var pagetitle = req.body.name;
    var imageName=req.files.myimage.name; // image name is saved
    var image=req.files.myimage // save file in temp buffer
    var imgpath='public/contact_images/'+imageName;
    image.mv(imgpath,function(err){
        console.log(err);
    });
   
    //fetch the contac with the id from URL from the database
    Header.findOne({type:'header'}).exec(function(err,header){
        // edit the fetch object from the database
        header.type='header';
        header.pagetitle=pagetitle;
        header.logo=imageName;
        header.save().then( ()=>{
            console.log('Header updated');
        });
    });
    res.redirect('/allpages');
});

myApp.get('/delete/:id',function(req, res){
    var id=req.params.id;
    //res.send(localname);
    Allpages.findByIdAndDelete({_id:id}).exec(function(err,page){
        Header.findOne({type:'header'}).exec(function(err,header){
            res.render('delete',{header:header})
        });
    });
});

myApp.get('/single/:anyname',function(req, res){
    var localname=req.params.anyname;
    console.log(localname)
    if(localname=='Home')
    {
        res.redirect('/');
    }
    //res.send(localname);
    Allpages.find({}).exec(function(err,pages){
        Header.findOne({type:'header'}).exec(function(err,header){
            Allpages.findOne({pagetitle:localname}).exec(function(err,page){
            res.render('Singlepage',{header:header,pages:pages,page:page})
        })});  
    });
  
   // res.render('singlecontclsact');
});
//----------- Start the server -------------------

myApp.listen(8080);
console.log('Server started at 8080 for spm...');