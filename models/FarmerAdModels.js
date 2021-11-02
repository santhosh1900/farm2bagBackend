const mongoose          = require("mongoose");

const FarmerAdvertisementSchema = mongoose.Schema({
    Name                    : String,
    UserId                  : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" },
    ImageUrl                : String,
    ImageId                 : String,
    VideoId                 : { type : String , default : "" },
    VideoUrl                : { type : String , default : "" },
    ProductDescription      : String,
    City                    : String,
    Created                 : { type : Date , default : Date.now() },
    Views                   : [
        {
            User  : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" }
        }
    ],
    ViewsCount              : { type : Number , default : 0 },
    CommentsCount           : { type : Number , default : 0 },
    Comments                : [
        {
            Comment : { type :  mongoose.Schema.Types.ObjectId , ref : "Comment" }
        }             
    ]
});

module.exports = mongoose.model("FarmerAdvertisement" , FarmerAdvertisementSchema);