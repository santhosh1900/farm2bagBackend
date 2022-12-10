const mongoose          = require("mongoose");

const OTP_Model = mongoose.Schema({
    phoneNumer      : { type : String },
    otp             : { type : String },
    otp_verified    : { type : Boolean , default : false },
    created         : { type : Date , default : Date.now() }        
});

module.exports = mongoose.model("OTPModel" , OTP_Model);