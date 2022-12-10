const Joi               = require("joi"),
      HttpStatus        = require("http-status-codes");
var   User              = require("../models/UserModels"),
      OtpModel          = require("../models/OtpModels"),    
      Helpers           = require("../Helpers/helpers"),
      Address_Model     = require("../models/AddressModels"),
      Customer_Cart     = require("../models/PresentCartModels"),
      FarmerAd          = require("../models/FarmerAdModels"),
      WholesaleAd       = require("../models/WholesaleAdModels"),
      Comment           = require("../models/CommentModel");

module.exports = {
    async PostFarmAdComment(req,res){
        try{
            var FarmAdId      = await FarmerAd.findById(req.body.FarmerId);
            if(FarmAdId){
                var commentbody = {
                    UserId          : req.user._id ,
                    Text            : req.body.body.Comment,
                    FarmAdId        : req.body.FarmerId,
                    WholesaleAd     : req.body.FarmerId,
                    Created         : new Date(), 
                }

                var Created_comment = await Comment.create(commentbody);
                var pushcomment     = {
                    Comment : Created_comment._id
                }
                FarmAdId.Comments.push(pushcomment);
                FarmAdId.CommentsCount  = FarmAdId.CommentsCount + 1;
                await FarmAdId.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Your Comment Is Created" , Created_comment});
            }
            else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message :"No FarmerAd Found"});
            }


        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async GetAllFarmersAdComments(req,res){
        try{
            var Comments     = await Comment.find({ FarmAdId : req.params.Id }).populate("UserId" , "_id Username ProfilePic").sort({ Created : -1 });
            if(Comments){
                return res
                .status(HttpStatus.OK)
                .json(Comments);
            }else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message :"No FarmerAd Found"});
            }

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async DeleteFarmerAdComment(req,res){
        try{
            var comment        = await Comment.findOne({ $and : [ { _id : req.params.CommentId } , { UserId : req.params.UserId } ] });
            if(comment){
                await comment.remove();
                await FarmerAd.updateOne({
                    _id: req.params.FarmAdId,
                }, {
                    $pull : { Comments : {
                        Comment : comment._id
                    }},
                    $inc : { CommentsCount : -1 }
                })
                .then(()=>{
                    return res
                    .status(HttpStatus.OK)
                    .json({message : "You Deleted The Comment"});
                });
            }else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "Comment Not Found"}); 
            }

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async UpdateComment(req,res){
        try{
            var comment         = await Comment.findOne({ $and : [ { _id : req.body.CommentId } , { UserId : req.body.CurrentUserId } ] });
            if(comment){
                comment.Text    = req.body.Text;
                comment.Created = new Date();
                comment.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Comment Updated" , comment}); 
                
            }else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "Comment Not Found"});
            }
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message});  
        }
    },

    async GetAllWholesaleAdComments(req,res){
        try{
            var Comments     = await Comment.find({ WholesaleAd : req.params.Id }).populate("UserId" , "_id Username ProfilePic").sort({ Created : -1 });
            if(Comments){
                return res
                .status(HttpStatus.OK)
                .json(Comments);
            }else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message :"No FarmerAd Found"});
            }

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async PostWholesaleAdComment(req,res){
        try{
            var wholesalead      = await WholesaleAd.findById(req.body.WholesaleAdId);
            if(wholesalead){
                var commentbody = {
                    UserId          : req.user._id ,
                    Text            : req.body.body.Comment,
                    FarmAdId        : req.body.WholesaleAdId,
                    WholesaleAd     : req.body.WholesaleAdId,
                    Created         : new Date(), 
                }

                var Created_comment = await Comment.create(commentbody);
                var pushcomment     = {
                    Comment : Created_comment._id
                }
                wholesalead.Comments.push(pushcomment);
                wholesalead.CommentsCount  = wholesalead.CommentsCount + 1;
                await wholesalead.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Your Comment Is Created" , Created_comment});
            }
            else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message :"No Wholesale AD Found Found"});
            }

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async DeleteWholesaleAdComment(req,res){
        try{
            var comment        = await Comment.findOne({ $and : [ { _id : req.params.CommentId } , { UserId : req.params.UserId } ] });
            if(comment){
                await comment.remove();
                await WholesaleAd.updateOne({
                    _id: req.params.WholesaleAdId,
                }, {
                    $pull : { Comments : {
                        Comment : comment._id
                    }},
                    $inc : { CommentsCount : -1 }
                })
                .then(()=>{
                    return res
                    .status(HttpStatus.OK)
                    .json({message : "You Deleted The Comment"});
                });
            }else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "Comment Not Found"}); 
            }

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },
}