var getMaxBookingDate = function() {
    var dtToday = new Date();
                
    var month = dtToday.getMonth() + 6;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();
    
    var maxDate = year + '-' + month + '-' + day;
    console.log('max date :'+maxDate);
    return new Date(year,month,day);
}