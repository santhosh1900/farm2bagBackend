const jwt           = require("jsonwebtoken"),
      dbConfig      = require("../config/secret"),
      HttpStatus    = require("http-status-codes"),
      Usermodel     = require("../models/UserModels");

module.exports = {
    VerifyToken : async (req , res , next) => {
        try{
            if(!req.headers.authorization){
                return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message : "No Authorization" });
            }
            if(req.headers.authorization.split(" ")[0] !== "fArM2BaGSanDy"){
                return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message : "No Authorization" });
            }
            const token = req.cookies.auth || req.headers.authorization.split(" ")[1] ;
            if(!token) {
                return res.status(HttpStatus.FORBIDDEN).json({ message : "No token provided" });
            }
            return jwt.verify(token , dbConfig.secret , async (err , decoded) => {
                if(err) {
                    if(err.expiredAt < new Date()) {
                        return res
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .json({
                                message : "Token has expired. Please login again",
                                token : null
                                })
                    }
                    next();
                }
                req.user = decoded.data;
                var userdata = await Usermodel.findById(req.user._id).select("_id");
                if(userdata){
                    next();
                }else{
                    return res
                    .status(HttpStatus.UNAUTHORIZED)
                    .json({ message : "No Authorization" });
                }
            });
            
        }catch(err){
            return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ message : "No Authorization" });
        }
    },

    VerifyHeader : (req , res , next) => {
        if(!req.headers.authorization){
            return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ message : "No Authorization" });
        } 
        if(req.headers.authorization.split(" ")[0] !== "fArM2BaGSanDy"){
            return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ message : "No Authorization" });
        }
        else{
            return next();
        }
    }
};