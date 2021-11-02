const mongoose          = require("mongoose");

const CommentSchema = mongoose.Schema({
    UserId          : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" },
    Text            : String,
    FarmAdId        : { type : mongoose.Schema.Types.ObjectId , ref : "FarmerAdvertisement"},
    WholesaleAd     : { type : mongoose.Schema.Types.ObjectId , ref : "WholeSaleAd"},
    Created         : { type : Date , default : Date.now() }, 
})

module.exports = mongoose.model("Comment" , CommentSchema);