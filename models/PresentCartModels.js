const mongoose          = require("mongoose");

const Present_Cart = mongoose.Schema({
    Cart        : [
        {
            Vegitable  : { type : mongoose.Schema.Types.ObjectId , ref : "Vegetable" },
            Quantity   : { type : Number }
        }
    ],
    Created         : { type : Date },
    Owned_By        : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" },
    Cart_Purchased  : { type : Boolean , default : false },
    Delivered       : { type : Boolean , default : false },
    GrandTotal      : { type : Number },
    Canceled        : { type : Boolean , default : false },
    Location        : String,
    DeliveryAddress : { type : mongoose.Schema.Types.ObjectId , ref : "Address" }
});

module.exports = mongoose.model("PresentCart" , Present_Cart);