// Create Property
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
const bookProperty = (req, res, Booking) => {
    // property_id: String,
    // customer_id: String,
    // checkinDate: Date,
    // checkoutDate: Date,
    // Guest: Number,
    // Rooms: Number,
    // TotalPrice: Number   
  //   res.render('confirmation',{
  //     BookingInfo : ,
  //     UserInfo : req.session.UserInfo
     
  // });
    let booking = new Booking({       
        property_id: req.session.BookingInfo.PropertyID,
        customer_id:  req.session.BookingInfo.CustomerID,
        checkinDate: req.session.BookingInfo.CheckInDate,
        checkoutDate: req.session.BookingInfo.CheckOutDate,
        guests: req.session.BookingInfo.Guests,
        rooms: req.session.BookingInfo.Rooms,
        totalPrice:req.session.BookingInfo.TotalPrice,
        totalNights : req.session.BookingInfo.TotalNights,        
        bookingDate : new Date()
    });
    
    booking.save()
        .then(() => {
            if(req.session.BookingInfo.ReservationEmailID)
            {
            // var emailtext ='<br/><br/><B>Your Reservation Details:</B><br/><ul>'+
            //     '<li>Rental Name : '+booking.propertyName+'</li>'+
            //      "<li>CheckIn Date : "+getFormattedDate(Date.parse(booking.checkinDate)) +"</li>"+
            //     "<li>CheckOut Date : "+getFormattedDate(Date.parse(booking.checkoutDate)) +"</li>"+
            //     "<li>Guests : "+booking.guests+"</li>"+
            //     "<li>Rooms : "+booking.rooms+"</li>"+
            //     "<li>Total Price : "+booking.totalPrice+"</li>"+
            //     "<li>Total Nights : "+booking.totalNights+"</li>"+
            //     "<li>Booked On : "+getFormattedDate(Date.parse(booking.bookingDate)) + " "+getFormattedTime(Date.parse(booking.bookingDate))+"</li>"+
            //     "</ul>"+
            //   "<h2>Thank you for your reservation</h2><br/>"+
            //   "Regards,<br/>"+
            //   "SPM Team";


            var emailtext ="<div align=\"center\"><table style=\"font-size: 16px;font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif\""+
            
    "<tr colspan=\"2\"> <td><h3>Your Reservation Details</h3></td> </tr>"+
    "<tr> <td>Rental Name</td> <td>"+ req.session.BookingInfo.PropertyName+"</td> </tr>"+
    "<tr> <td>CheckIn Date</td> <td>"+dateFormat(new Date(Date.parse(booking.checkinDate)),"dd mmm yyyy")+"</td> </tr>"+
    "<tr> <td>CheckOut Date</td> <td>"+dateFormat(new Date(Date.parse(booking.checkoutDate)),"dd mmm yyyy")+"</td> </tr>"+
    "<tr> <td>Total Nights</td> <td>"+booking.totalNights+"</td> </tr>"+
    "<tr> <td>Price/Night</td> <td>$"+req.session.BookingInfo.PricePerNight+"</td> </tr>"+
    "<tr> <td>Guests</td> <td>"+booking.guests+"</td> </tr>"+
    "<tr> <td>Rooms</td> <td>"+booking.rooms+"</td> </tr>"+
    "<tr> <td>Total Price</td> <td>$"+booking.totalPrice+"</td> </tr>"+
    "<tr> <td>Booked On</td> <td>"+getFormattedDate(Date.parse(booking.bookingDate)) +
     " "+getFormattedTime(Date.parse(booking.bookingDate))+"</td> </tr><tr></tr></table></div>"+
     "<br><br><i style=\"font-size: 14px;color:red\">Thank you for your reservation</i><br><br>Regards,<br/>"+
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
                    to: req.session.BookingInfo.ReservationEmailID,
                    subject: 'Your Reservation for '+ req.session.BookingInfo.PropertyName+' from ['+
                    dateFormat(new Date(Date.parse(booking.checkinDate)),"dd mmm yyyy")+' to '+
                    dateFormat(new Date(Date.parse(booking.checkoutDate)),"dd mmm yyyy")+'] Confirmed',
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
            // res.json({
            //     status: 1
            //   });
            res.render('confirmation',{
                  BookingInfo : req.session.BookingInfo,
                  UserInfo : req.session.UserInfo
                 
               });
        })
        .catch(() => {
            // req.flash('errorMsg', 'Something went wrong while Booking Property!');
            // res.redirect('/user-dashboard');
            // res.json({
            //     status: -1
            //   });
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