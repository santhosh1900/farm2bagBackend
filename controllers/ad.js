const Joi               = require("joi"),
      HttpStatus        = require("http-status-codes");
const { use } = require("../routes/Advertisement");
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
      Customer_Cart     = require("../models/PresentCartModels"),
      FarmerAd          = require("../models/FarmerAdModels"),
      WholesaleAd       = require("../models/WholesaleAdModels"),
      cloudinary        = require('cloudinary');

cloudinary.config({ 
    //these vaues are get from the clouinary dshboard
    cloud_name: 'dahmo2frl', 
    api_key: "137383149455181", 
    api_secret: "rHS5rlkDIDUVRhIbZSX5rUqMYp8"
});

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

    },

    async PostFarmerAd(req,res){
        try{
            var farmer_ad     = await FarmerAd.findOne({ UserId : req.user._id });
            var user          = await User.findById(req.user._id);
            if(farmer_ad){
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "You Cannot Post More Than One Ad"});
            }
            var FarmerAdBody = {
                UserId                  : req.user._id,
                ImageUrl                : req.body.ImgURL,
                ImageId                 : req.body.ImgId,
                VideoId                 : req.body.VideoId,
                VideoUrl                : req.body.VideoURL,
                ProductDescription      : req.body.body.ProductDesc,
                City                    : req.body.body.City,
                Name                    : req.body.body.Name
            };
            var created_ad   = await FarmerAd.create(FarmerAdBody);
            user.FarmerAd    = true;
            await user.save();
            return res
            .status(HttpStatus.OK)
            .json({message : "Ad is created" });

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async GetUserAds(req,res){
        try{    
            var farmer_ad               = await FarmerAd.findOne({ UserId : req.user._id });
            var wholesale_ad            = await WholesaleAd.findOne({ UserId : req.user._id });
            var wholesaleAdpresent      = false;
            var farmerAdPresent         = false;
            if(wholesale_ad){
                wholesaleAdpresent      = true; 
            }
            if(farmer_ad){
                farmerAdPresent         = true;
            }
            return res
            .status(HttpStatus.OK)
            .json({wholesaleAdpresent , farmerAdPresent});        
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async DeleteFarmerAdd(req,res){
        try{
            var farmer_ad   = await FarmerAd.findOne({ UserId : req.user._id });
            var user        = await User.findById(req.user._id);
            if(farmer_ad){
                await cloudinary.v2.uploader.destroy(farmer_ad.ImageId);
                if(farmer_ad.VideoId){
                    await cloudinary.v2.uploader.destroy(farmer_ad.VideoId , { resource_type : 'video'});
                };
                await farmer_ad.remove();
                user.FarmerAd = false;
                await user.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Your Ad is deleted"}); 
            }
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "You Doesn't Have Any Ads"}); 
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message}); 
        }
    },

    async PostWholesaleAd(req,res){
        try{
            var wholesale_ad     = await WholesaleAd.findOne({ UserId : req.user._id });
            var user             = await User.findById(req.user._id);
            if(wholesale_ad){
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "You Cannot Post More Than One Ad"});
            }
            var new_address     = {
                Line1           : Helpers.firstUpper(req.body.body.Line1),
                Line2           : Helpers.firstUpper(req.body.body.Line2),
                City            : Helpers.firstUpper(req.body.body.City),
                State           : Helpers.firstUpper(req.body.body.State),
                Pincode         : req.body.body.Pincode,
                Landmark        : Helpers.firstUpper(req.body.body.Landmark),
                Area            : Helpers.firstUpper(req.body.body.Area),
                Latitude        : req.body.Latitude,
                Longitude       : req.body.Longitude
            };
            var created_cart         = await Address_Model.create(new_address);
            var new__body            = {
                Name                    : req.body.body.ProdcutName,
                UserId                  : req.user._id,
                ImageUrl                : req.body.ImgURL,
                ImageId                 : req.body.ImgId,
                VideoId                 : req.body.VideoId,
                VideoUrl                : req.body.VideoURL,
                AddressProffUrl         : req.body.proffURL,
                AddressProffId          : req.body.proffId,
                ProductDescription      : req.body.body.ProductDesc,
                City                    : req.body.body.City,
                Address                 : created_cart._id
            };
            var created_ad       = await WholesaleAd.create(new__body);
            user.WholesaleAd     = true;
            await user.save();
            return res
            .status(HttpStatus.OK)
            .json({message : "Ad is created" });
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },


    async DeleteWoleSaleAd(req,res){
        try{
            var wholesale_ad         = await WholesaleAd.findOne({ UserId : req.user._id });
            var user                 = await User.findById(req.user._id);
            if(wholesale_ad){
                var address          = await Address_Model.findById(wholesale_ad.Address);
                await cloudinary.v2.uploader.destroy(wholesale_ad.ImageId);
                await cloudinary.v2.uploader.destroy(wholesale_ad.AddressProffId);
                if(wholesale_ad.VideoId){
                    await cloudinary.v2.uploader.destroy(wholesale_ad.VideoId , { resource_type : 'video'});
                }
                await wholesale_ad.remove();
                await address.remove();
                user.WholesaleAd     = false;
                await user.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Ad is successfully deleted" });
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "NO Ad found"});
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message});
        }
    },

    async GetFarmerAd(req,res){
        try{
            var farmad = await FarmerAd.findOne({ UserId : req.user._id });
            if(farmad){
                return res
                .status(HttpStatus.OK)
                .json(farmad);
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "Not found"});            

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async EditFarmerAd(req,res){
        try{
            var farmad = await FarmerAd.findOne({ UserId : req.user._id });
            if(farmad){
                if(req.body.ImageId){
                    await cloudinary.v2.uploader.destroy(farmad.ImageId);
                    farmad.ImageId  = req.body.ImageId;
                    farmad.ImageUrl = req.body.ImageUrl;
                }
                if(req.body.VideoId){
                    await cloudinary.v2.uploader.destroy(farmad.VideoId , { resource_type : 'video'});
                    farmad.VideoId  = req.body.VideoId;
                    farmad.VideoUrl = req.body.VideoUrl;
                }
                farmad.ProductDescription = req.body.body.ProductDesc;
                farmad.City               = req.body.body.City;
                farmad.Created            = new Date();
                farmad.Name               = req.body.body.Name;
                farmad.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Updated" , farmad});
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "Not found"}); 

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async GetWholesaleAd(req,res){
        try{
            var wholesalead   = await WholesaleAd.findOne({ UserId : req.user._id }).populate("Address");
            if(wholesalead){
                return res
                .status(HttpStatus.OK)
                .json(wholesalead)
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "No ad Found"})

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async UpdateWholesaleAdPoster(req,res){
        try{
            var wholesalead   = await WholesaleAd.findOne({ UserId : req.user._id });
            if(wholesalead){
                await cloudinary.v2.uploader.destroy(wholesalead.ImageId);
                wholesalead.ImageId     = req.body.ImageId;
                wholesalead.ImageUrl    = req.body.ImageUrl;
                await wholesalead.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Poster Updated"}); 
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "No ad Found"})
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async UpdateWholesaleAdAddessProff(req,res){
        try{
            var wholesalead   = await WholesaleAd.findOne({ UserId : req.user._id });
            if(wholesalead){
                await cloudinary.v2.uploader.destroy(wholesalead.AddressProffId);
                wholesalead.AddressProffId      = req.body.ImageId;
                wholesalead.AddressProffUrl     = req.body.ImageUrl;
                await wholesalead.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Poster Updated"}); 
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "No ad Found"})
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async UpdateWholesaleAdVideo(req,res){
        try{
            var wholesalead   = await WholesaleAd.findOne({ UserId : req.user._id });
            if(wholesalead){
                await cloudinary.v2.uploader.destroy(wholesalead.VideoId, { resource_type : 'video' });
                wholesalead.VideoId     = req.body.VideoId;
                wholesalead.VideoUrl    = req.body.VideoUrl;
                await wholesalead.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Poster Updated"}); 
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "No ad Found"})
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async UpdateWholesaleAd(req,res){
        try{
            var wholesalead                     = await WholesaleAd.findOne({ UserId : req.user._id });
            var address                         = await Address_Model.findById(wholesalead.Address);
            if(wholesalead){
                wholesalead.City                = req.body.body.City;
                wholesalead.ProductDescription  = req.body.body.ProductDesc;
                wholesalead.Name                = req.body.body.Name;
                wholesalead.Created             = new Date();
                await wholesalead.save();
                address.Line1                   = Helpers.firstUpper(req.body.body.Line1);
                address.Line2                   = Helpers.firstUpper(req.body.body.Line2);
                address.City                    = req.body.body.City;
                address.State                   = Helpers.firstUpper(req.body.body.State);
                address.Pincode                 = req.body.body.Pincode;
                address.Landmark                = Helpers.firstUpper(req.body.body.Landmark);
                address.Area                    = Helpers.firstUpper(req.body.body.Area);
                await address.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Ad Updated"});
            }
            return res
            .status(HttpStatus.NOT_FOUND)
            .json({message : "No ad Found"});
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async GetAllFarmersAds(req,res){
        try{
            // var numberofcontent     = parseInt(req.query.numberofcontent);
            // var perPage             = numberofcontent ? numberofcontent : 10;
            // var pageQuery           = parseInt(req.query.page);
            // var pageNumber          = pageQuery ? pageQuery : 1;
            var ALLFarmerAds        = await FarmerAd.find({City : req.params.location})
                                        .sort({ Created : -1 })
                                        .populate("UserId" , "_id Username ProfilePic")
                                        .select("-Comments");
            return res
            .status(HttpStatus.OK)
            .json({message : "All Farm Posts" , ALLFarmerAds})

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async GetAllWholesaleAds(req,res){
        try{
            // var numberofcontent     = parseInt(req.query.numberofcontent);
            // var perPage             = numberofcontent ? numberofcontent : 10;
            // var pageQuery           = parseInt(req.query.page);
            // var pageNumber          = pageQuery ? pageQuery : 1;
            var AllWholesaleAds        = await WholesaleAd.find({City : req.params.location})
                                            .sort({ Created : -1 })
                                            .populate("UserId" , "_id Username ProfilePic PhoneNumber")
                                            .populate("Address")
                                            .select("-Comments");
            return res
            .status(HttpStatus.OK)
            .json({message : "All Farm Posts" , AllWholesaleAds})

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async AddFarmerViews(req,res){
        try{        
            const AdId = req.body.Id;
            await FarmerAd.updateOne({
                _id          : AdId,
                "Views.User" : { $ne : req.user._id }
            }, {
                $push : { Views : {
                    User : req.user._id
                }},
                $inc : { ViewsCount  : 1 }
            })
            .then(async() =>{
                return res
                .status(HttpStatus.OK)
                .json({message : "You Viewed the post"});
            })

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async AddWholesaleViews(req,res){
        try{
            const AdId = req.body.Id;
            await WholesaleAd.updateOne({
                _id          : AdId,
                "Views.User" : { $ne : req.user._id }
            }, {
                $push : { Views : {
                    User : req.user._id
                }},
                $inc : { ViewsCount  : 1 }
            })
            .then(async() =>{
                return res
                .status(HttpStatus.OK)
                .json({message : "You Viewed the post"});
            })

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    }



}