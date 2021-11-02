const mongoose          = require("mongoose");

const AddressSchema = mongoose.Schema({
    Line1           : String,
    Line2           : String,
    Area            : String,
    City            : String,
    State           : String,
    Pincode         : String,
    Landmark        : String,
    Latitude        : { type : Number , default : 0 },
    Longitude       : { type : Number , default : 0 }
});

module.exports = mongoose.model("Address" , AddressSchema);