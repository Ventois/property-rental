const USER_SCHEMA = {
    firstname: String,
    lastname: String,
    phone: String,
    email: String,
    password: String,
    role: String,
    createdOn: Date,
    updatedOn: Date
};

const PROPERTY_SCHEMA = {
    rentalname: String,
    description: String,
    price: String,
    address: String,
    city: String,
    state: String,
    country: String,
    area: Number,
    rooms: Number,
    baths: Number,
    beds: Number,
    amenities: Array,
    rules: Array,
    images: Array,
    createdOn: Date,
    owner: String
};

const BOOKING_SCHEMA = {
    property_id: String,
    customer_id: String,
    checkinDate: Date,
    checkoutDate: Date,
    guests: Number,
    rooms: Number,
    totalPrice: Number,
    bookingDate:Date,
    totalNights:Number,
    emailNotification : String
};

module.exports = {
    USER_SCHEMA,
    PROPERTY_SCHEMA,
    BOOKING_SCHEMA
};
