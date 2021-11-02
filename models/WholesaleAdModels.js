const mongoose          = require("mongoose");

const WholeSaleAdSchema = mongoose.Schema({
    Name                    : String,
    UserId                  : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" },
    ImageUrl                : String,
    ImageId                 : String,
    VideoId                 : { type : String , default : "" },
    VideoUrl                : { type : String , default : "" },
    AddressProffUrl         : String,
    AddressProffId          : String,
    ProductDescription      : String,
    City                    : String,
    Created                 : { type : Date , default : Date.now() },
    Views                   : [
        {
            User  : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" }
        }
    ],
    Verified                : { type :  Boolean , default : false},
    Address                 : { type : mongoose.Schema.Types.ObjectId , ref : "Address" },
    ViewsCount              : { type : Number , default : 0 },
    CommentsCount           : { type : Number , default : 0 },
    Comments                : [
        {
            Comment : { type :  mongoose.Schema.Types.ObjectId , ref : "Comment" }
        }             
    ]
});

module.exports = mongoose.model("WholeSaleAd" , WholeSaleAdSchema);