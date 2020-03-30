// Create Property
var nodemailer = require('nodemailer');
const bookProperty = (req, res, Booking) => {
    // property_id: String,
    // customer_id: String,
    // checkinDate: Date,
    // checkoutDate: Date,
    // Guest: Number,
    // Rooms: Number,
    // TotalPrice: Number   
    
    let booking = new Booking({       
        property_id: req.body.PropertyID,
        customer_id:  req.body.CustomerID,
        checkinDate: req.body.CheckInDate,
        checkoutDate: req.body.CheckOutDate,
        guests: req.body.Guests,
        rooms: req.body.Rooms,
        totalPrice: req.body.TotalPrice,
        totalNights : req.body.TotalNights,
        bookingDate : new Date()
    });
    
    booking.save()
        .then(() => {
            if(req.body.EmailID)
            {
            var emailtext ='<br/><br/><B>Your Reservation Details:</B><br/><ul>'+
                '<li>Rental Name : '+req.body.RentalName+'</li>'+
                 "<li>CheckIn Date : "+getFormattedDate(Date.parse(booking.checkinDate)) +"</li>"+
                "<li>CheckOut Date : "+getFormattedDate(Date.parse(booking.checkoutDate)) +"</li>"+
                "<li>Guests : "+booking.guests+"</li>"+
                "<li>Rooms : "+booking.rooms+"</li>"+
                "<li>Total Price : "+booking.totalPrice+"</li>"+
                "<li>Total Nights : "+booking.totalNights+"</li>"+
                "<li>Booked On : "+getFormattedDate(Date.parse(booking.bookingDate)) + " "+getFormattedTime(Date.parse(booking.bookingDate))+"</li>"+
                "</ul>"+
              "<B>Thank you for your reservation</B><br/>"+
              "Regards,<br/>"+
              "SPM Team";

            //before using any email please goto below link accept the permissions
            //https://myaccount.google.com/lesssecureapps?pli=1
                //Send an Email Confirmation With ProperInfo
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'team.spm.2020@gmail.com',
                      pass: 'spmteam@123'
                    }
                  });
                 
                  var mailOptions = {
                    from: 'team.spm.2020@gmail.com',
                    to: req.body.EmailID,
                    subject: 'Your Reservation Details from SPM',
                    html: emailtext
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                }
            // req.flash('successMsg', 'Property Booked successfully!');
            // res.redirect('/user-dashboard');
            res.json({
                status: 1
              });
        })
        .catch(() => {
            // req.flash('errorMsg', 'Something went wrong while Booking Property!');
            // res.redirect('/user-dashboard');
            res.json({
                status: -1
              });
        });
};

const deleteBooking = (req, res, Booking) => {
    var id = req.params.id;
        Booking.findByIdAndDelete({_id: id}).exec(function (err) {
            if (err) {
                req.flash('errorMsg', 'Something went wrong while deleting Reservation!');
                res.redirect('/user-dashboard');
            } else {
                req.flash('successMsg', 'Reservation deleted successfully!');
                res.redirect('/user-dashboard');
            }
            
        });
};

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


module.exports = {
    bookProperty,
    deleteBooking
};