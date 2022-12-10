const Joi               = require("joi"),
      HttpStatus        = require("http-status-codes");
var   User              = require("../models/UserModels"),
      OtpModel          = require("../models/OtpModels"),    
      Helpers           = require("../Helpers/helpers"),
      bcrypt            = require("bcryptjs"),
      jwt               = require("jsonwebtoken"),
      bdConfig          = require("../config/secret"),
      {twillo_sdk}      = require("../key"),
      {twillo_token}    = require("../key"),
      client            = require('twilio')(twillo_sdk , twillo_token),
      Address_Model     = require("../models/AddressModels"),
      Customer_Cart     = require("../models/PresentCartModels");

module.exports = {
    async GetAllOrders(req,res){
        try{
            var NotDelivered =  await Customer_Cart.find({ $and : [ { Cart_Purchased: true } , { Delivered : false } ] })
            .populate("Cart.Vegitable")
            .sort({ "Created" : -1 });

            var Delivered =  await Customer_Cart.find({ $and : [ { Cart_Purchased: true } , { Delivered : true } ] })
            .populate("Cart.Vegitable")
            .sort({ "Created" : -1 });
            
            return res
            .status(HttpStatus.OK)
            .json({ message : "All Orders", NotDelivered , Delivered });

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }

    }
}