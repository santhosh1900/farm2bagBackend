const mongoose          = require("mongoose");

const User_Model = mongoose.Schema({
    PhoneNumber         : { type : String },
    ProfilePic          : { type : String , default : "https://www.haa.pitt.edu/sites/default/files/default_images/noimg.png" },
    ProfileId           : String,
    Username            : { type : String },
    Adderss             : [
        {
            User_Address : { type : mongoose.Schema.Types.ObjectId , ref : "Address" }
        }
    ],
    Gender              : { type : String  , default : "" },
    Email               : { type : String , default : ""  },
    Password            : { type : String},
    Forgot_Password_Otp : { type : String },
    PhoneChange_Otp     : { type : String },
    Present_Cart        : { type : mongoose.Schema.Types.ObjectId , ref : "PresentCart" },
    Admin               : { type : Boolean , default : false },
    HappyCustomers      : { type : Number , default : 0 },
    FarmerAd            : { type : Boolean , default : false },
    WholesaleAd         : { type : Boolean , default : false },
    Longitude           : { type : Number , default : 0 },
    Latitude            : { type : Number , default : 0 }, 
    chatList            : [
        {
            receiverId  : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" },
            msgId       : { type : mongoose.Schema.Types.ObjectId , ref : "Message" }
        }
    ],
});

module.exports = mongoose.model("UserModel" , User_Model);