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
      Customer_Cart     = require("../models/PresentCartModels"),
      cloudinary        = require('cloudinary');

cloudinary.config({ 
    //these vaues are get from the clouinary dshboard
    cloud_name: 'dahmo2frl', 
    api_key: "137383149455181", 
    api_secret: "rHS5rlkDIDUVRhIbZSX5rUqMYp8"
});

      

module.exports = {
    async CtreateOtp (req,res) {
        try{
            const MobileNumber  = req.body.mobilenumber;
            var RandomOTP       = Math.floor(100000 + Math.random() * 900000) + "";
            var userPhone       = await User.findOne({PhoneNumber : MobileNumber});
            if(userPhone){
                return res
                .status(HttpStatus.CONFLICT)
                .json({ message : "Username already exist" });
            };
            var userOtp         = await OtpModel.findOne({phoneNumer : MobileNumber });
            if(userOtp){
                userOtp.otp     = RandomOTP.substring(2);
                userOtp.save();

                client.messages 
                .create({ 
                body: `Your farm to back otp is ${userOtp.otp}`, 
                from: '+13345084837',       
                to: `+91${MobileNumber}` 
                }) 
                // .then(message => res.json({message : "OTP is sent to your mobile number"})) 
                .done();

                return res
                .status(HttpStatus.OK)
                .json({message : "OTP number is already existed" })
            }else
            {
                const body          = {
                    phoneNumer      : MobileNumber,
                    otp             : RandomOTP.substring(2)
                };
                var Otp = await OtpModel.create(body);

                client.messages 
                .create({ 
                body: `Your farm to back otp is ${body.otp}`, 
                from: '+13345084837',       
                to: `+91${MobileNumber}` 
                })
                // .then(message => res.json({message : "OTP is sent to your mobile number"})) 
                .done();

                return res
                .status(HttpStatus.OK)
                .json({message : "number is created" , Otp})
            }
        }catch(err){
            console.log(err)
        }
    },

    async EditOTPNumber(req,res){
        try{
            const MobileNumber      = req.body.mobilenumber;
            const PreviousNumber    = req.body.PreviousNumber;
            var RandomOTP           = Math.floor(100000 + Math.random() * 900000) + "";
            var userPhone           = await User.findOne({PhoneNumber : MobileNumber});
            if(userPhone){
                return res
                .status(HttpStatus.CONFLICT)
                .json({ message : "Username already exist" });
            };
            var userOtp         = await OtpModel.findOne({phoneNumer : PreviousNumber });
            userOtp.phoneNumer  = MobileNumber;
            userOtp.otp         = RandomOTP.substring(2);
            userOtp.save();

            client.messages 
            .create({ 
            body: `Your farm to back otp is ${userOtp.otp}`, 
            from: '+13345084837',       
            to: `+91${userOtp.phoneNumer}` 
            }) 
            // .then(message => res.json({message : "OTP is sent to your mobile number"})) 
            .done();

            return res
            .status(HttpStatus.OK)
            .json({message : "OTP number is changed and otp is"});

        }catch(err){
            console.log(err)
        }
    },

    async Verifyotp (req,res) {
        try{
            const OTP           = req.body.otp + "";
            const MobileNumber  = req.body.mobilenumber + ""; 
            var otp_modal       = await OtpModel.findOne({phoneNumer : MobileNumber , otp : OTP});
            if(otp_modal){
                res.json({message : "OTP is Verified" , otp_modal})
            }else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "Incorrect OTP"});
            }
        }catch(err){
            console.log(err)
        }
    },

    async RegisterUser (req,res) {
        try{
            var Username    = req.body.username,
                Password    = req.body.password,
                PhoneNumber = req.body.phone;
            var userPhone   = await User.findOne({PhoneNumber : PhoneNumber});
            if(userPhone){
                return res
                .status(HttpStatus.CONFLICT)
                .json({ message : "MobileNumber already exist" });
            };
            return bcrypt.hash(Password , 13 , (err, hash) => {
                if(err){
                    return res
                        .status(HttpStatus.BAD_REQUEST)
                        .json({ message : "Please enter valid password" })
                }
                const body = {
                    PhoneNumber : PhoneNumber,
                    Username    : Helpers.firstUpper(Username),
                    Password    : hash
                };
                User.create(body).then(async user => {
                    var token_user = await User.findById(user._id).select("Username").select("_id").select("Admin");
                    const token = jwt.sign({ data : token_user } , bdConfig.secret , {
                        expiresIn : "1hr"
                    });
                    res.cookie("auth" , token);
                    var otp_modal       = await OtpModel.findOne({phoneNumer : PhoneNumber});
                    otp_modal.remove();
                    return res
                        .status(HttpStatus.CREATED)
                        .json({ message : "User created successfully",token });
                }).catch(error => {
                    return res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({message : "Oops something went wrong"});
                });
            });
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Oops something went wrong"});
        }
    },

    async LoginUser(req,res){
        try{
            const PhoneNumber   = req.body.phone;
            const user          = await User.findOne({PhoneNumber : PhoneNumber}).select("_id").select("Username").select("Admin");
            const user2         = await User.findOne({PhoneNumber : PhoneNumber}).select("Password");
                if(!user){
                    return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({message : "Account not found"});
                }
                await bcrypt.compare(req.body.password , user2.Password).then((result) => {
                    if(!result){
                        return res
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({message : "Username or Password is incorrect"});
                    }
                    const token = jwt.sign({data : user } , bdConfig.secret , {
                        expiresIn : "1hr"
                    });
                    res.cookie("auth" , token);
                    return res
                    .status(HttpStatus.OK)
                    .json({ message : "Login Successfully" , token });
            });
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured"});
        }
    },

    async ForgetPasswordOtpGenerate(req,res){
        try{
            var MobileNumber              = req.body.phoneNumer;
            var RandomOTP                 = Math.floor(100000 + Math.random() * 900000) + "";
            var userPhone                 = await User.findOne({PhoneNumber : MobileNumber}).select("-Password");
            if(!userPhone){
                return res
                .status(HttpStatus.NOT_FOUND)
                .json({message : "Account not found or MobileNumber is Incorrect"});
            }
            userPhone.Forgot_Password_Otp = RandomOTP.substring(2);
            userPhone.save();

            client.messages 
            .create({ 
            body: `Your farmtoback otp to change password is ${userPhone.Forgot_Password_Otp}`, 
            from: '+13345084837',       
            to: `+91${MobileNumber}` 
            }) 
            // .then(message => res.json({message : "OTP is sent to your mobile number"})) 
            .done();

            return res
            .status(HttpStatus.OK)
            .json({ message : "OTP is Sent To Your Mobile Number"});

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message :"Unknown Error Ooccured"});
        }
    },

    async SubmitForgetPasswordOtp(req,res){
        try{
            var MobileNumber    = req.body.phoneNumer;
            var otp             = req.body.otp;                 
            var userPhone       = await User.findOne({PhoneNumber : MobileNumber}).select("-Password");
            if(otp == userPhone.Forgot_Password_Otp){
                return res
                .status(HttpStatus.OK)
                .json({message : "OTP is Verified"})
            }
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message :"OTP is Incorrect"});

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message :"Unknown Error Ooccured"});
        }
    },

    async ChangePassword(req,res){
        try{
            var MobileNumber    = req.body.phoneNumer;
            var otp             = req.body.otp;
            var password        = req.body.password;
            var user            = await User.findOne( { $and : [ { PhoneNumber : MobileNumber } , { Forgot_Password_Otp : otp } ] } );
            if(!user){
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message :"OTP is Incorrect"}); 
            }
            return bcrypt.hash(password , 13 , (err, hash) => {
                if(err){
                    return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({ message : "Please enter valid password" })
                }
                user.Password = hash;
                user.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Password is Successfully Updated"});

            });
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message :"Unknown Error Ooccured"});
        }
    },

    async GetUserCart(req,res){
        try{
            var Present_Cart  = await Customer_Cart.findOne( { $and : [ { Owned_By : req.user._id} , { Cart_Purchased: false} ] } ).populate("Cart.Vegitable");
            if(!Present_Cart){
                return res
                .status(HttpStatus.OK)
                .json({message : "You Haven't Purchased Anything"});
            }
            return res
            .status(HttpStatus.OK)
            .json({message : "User cart is" , Present_Cart});

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message :"Unknown Error Ooccured"});
        }
    },

    async GetUserInfo(req,res){
        try{
            var CurrentUser = await User.findById(req.user._id)
            .select("-Password")
            .select("-Prevoius_Carts")
            .select("-Forgot_Password_Otp")
            .select("-Prevoius_Cart")
            .populate("Adderss.User_Address");
            return res
            .status(HttpStatus.OK)
            .json({message : "User is" ,CurrentUser});

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message :"Unknown Error Ooccured"});
        }
    },

    async EditUserInfo(req,res){
        try{
            var Username    = req.body.body.Username;
            var Email       = req.body.body.Email;
            var Gender      = req.body.body.Gender;
            var user        = await User.findById(req.user._id)
            .select("-Password")
            .select("-Prevoius_Carts")
            .select("-Forgot_Password_Otp")
            .select("-Prevoius_Cart")
            .populate("Adderss.User_Address");
            user.Username   = Username;
            user.Email      = Email;
            user.Gender     = Gender;
            user.save();
            const token = jwt.sign({data : user } , bdConfig.secret , {
                expiresIn : "1hr"
            });
            res.cookie("auth" , token);
            return res
            .status(HttpStatus.OK)
            .json({message : "Profile Updated" , user , token});
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async EditUserPhone(req,res){
        try{
            var Phonenumber         = req.body.number;
            var existed_user        = await User.findOne({PhoneNumber : Phonenumber});
            console.log(existed_user);
            if(!existed_user){
                var user                = await User.findById(req.user._id)
                .select("-Password")
                .select("-Prevoius_Carts")
                .select("-Forgot_Password_Otp")
                .select("-Prevoius_Cart")
                .populate("Adderss.User_Address");
                var RandomOTP           = Math.floor(100000 + Math.random() * 900000) + "";
                // RandomOTP.substring(2);
                user.PhoneChange_Otp    = RandomOTP.substring(2);
                user.save();

                client.messages 
                .create({ 
                body: `Your farmtoback otp to change phone number is ${user.PhoneChange_Otp}`, 
                from: '+13345084837',       
                to: `+91${Phonenumber}` 
                }) 
                // .then(message => res.json({message : "OTP is sent to your mobile number"})) 
                .done();

                return res
                .status(HttpStatus.OK)
                .json({message : "OTP is Sent to Your Mobile Number" });
            }
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "User Already Exist With This Mobile Number"});
            
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async ChangePhoneNumber(req,res){
        try{
            var user                = await User.findById(req.user._id)
            .select("-Password")
            .select("-Prevoius_Carts")
            .select("-Forgot_Password_Otp")
            .select("-Prevoius_Cart")
            .populate("Adderss","User_Address");
            var otp                 = req.body.otp;
            if(user.PhoneChange_Otp == otp){
                user.PhoneNumber = req.body.number;
                user.save();
                const token = jwt.sign({data : user } , bdConfig.secret , {
                    expiresIn : "1hr"
                });
                res.cookie("auth" , token);
                return res
                .status(HttpStatus.OK)
                .json({message : "PhoneNumber Is Updated" , user , token}); 
            }else{
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "Incorrect OTP"}); 
            }
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});  
        }
    },

    async SubmitAddress(req,res){
        try{
            var user            = await User.findById(req.user._id);
            if(user.Adderss.length == 4){
                return res
                .status(HttpStatus.INSUFFICIENT_SPACE_ON_RESOURCE)
                .json({message : "You Cannot Add More Than Four Address"});
            }
            var new_address     = {
                Line1           : req.body.body.Line1,
                Line2           : req.body.body.Line2,
                City            : req.body.body.City,
                State           : req.body.body.State,
                Pincode         : req.body.body.Pincode,
                Landmark        : req.body.body.Landmark,
            };

            var created_cart = await Address_Model.create(new_address);
            var cartId       = {
                User_Address : created_cart._id
            };

            user.Adderss.push(cartId);
            user.save();
            return res
            .status(HttpStatus.OK)
            .json({message : "Address is saved" }); 
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"}); 
        }
    },

    async EditAddress(req , res){
        try{
            var address         = await Address_Model.findById(req.body.addressId);
            address.Line1       = req.body.body.Line1;
            address.Line2       = req.body.body.Line2;
            address.City        = req.body.body.City;
            address.State       = req.body.body.State;
            address.Pincode     = req.body.body.Pincode;
            address.Landmark    = req.body.body.Landmark;
            address.save();
            return res
            .status(HttpStatus.OK)
            .json({message : "Address Updated" });

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unkown Error Occured"});
        }
    },

    async DeleteAddress(req,res){
        try{
            var user                = await User.findById(req.user._id)
            .select("-Password")
            .select("-Prevoius_Carts")
            .select("-Forgot_Password_Otp")
            .select("-Prevoius_Cart")
            .populate("Adderss.User_Address");

            user.Adderss.forEach(addres => {
                if(addres._id + "" == req.params.id + ""){
                    addres.remove();
                    user.save();
                }
            });
            var address_tobe_remove         = await Address_Model.findById(req.params.addressId);
            address_tobe_remove.remove();
            return res
            .status(HttpStatus.OK)
            .json({message : "Address Deleted" , user});

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message});
        }
    },

    async CartPurchased(req,res){
        try{
            var user                    = await User.findById(req.user._id).populate("Present_Cart").select("-Password");
            var cart                    = await Customer_Cart.findById(user.Present_Cart._id);
            if(!cart.Cart_Purchased){
                cart.GrandTotal         = req.body.grandTotal;
                cart.Created            = new Date();
                cart.DeliveryAddress    = req.body.addressId;
                cart.Cart_Purchased     = true;
                cart.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Cart Is Purchased"});
            }
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Your Cart Is Empty"});  
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message});  
        }
    },

    async GetUserPreviousCart(req,res){
        try{
            var Prevoius_Carts  = await Customer_Cart.find( { $and : [ { Owned_By : req.user._id} , { Cart_Purchased: true } ] } )
            .populate("Cart.Vegitable")
            .sort({ "Created" : -1 });
            return res
            .status(HttpStatus.OK)
            .json({ Prevoius_Carts });
        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message}); 
        }
    },
    async SubmitUserLocation(req,res){
        try{
            var user            = await User.findById(req.user._id).select("-Password");
            user.Longitude      = req.body.Longitude;
            user.Latitude       = req.body.Latitude;
            await user.save();
            return res
            .status(HttpStatus.OK)
            .json({message : "Location Saved"});

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message}); 
        }
    },
    async GetUserById(req,res){
        try{
            var user = await User.findById(req.params.id).select("Username").select("_id").select("ProfilePic");
            if(user){
                return res
                .status(HttpStatus.OK)
                .json(user)
            }else{
                return res
                .status(HttpStatus.NOT_FOUND)
                .json({message : "User Not Found"})
            }

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message}); 
        }
    },
    async UpdateDp(req,res){
        try{
            var user        = await User.findById(req.user._id);
            if(user.ProfileId){
                await cloudinary.v2.uploader.destroy(user.ProfileId);
                user.ProfilePic = req.body.ImgUrl;
                user.ProfileId  = req.body.ImgId;
                await user.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "Profile Updated"});
            }
            user.ProfilePic = req.body.ImgUrl;
            user.ProfileId  = req.body.ImgId;
            await user.save();
            return res
            .status(HttpStatus.OK)
            .json({message : "Profile Updated"});

        }catch(err){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : err.message});
        }
    },  
}




// module.exports = {
//     async CtreateOtp (req,res) {
//         try{
//             const MobileNumber  = req.body.mobilenumber;
//             var RandomOTP       = Math.floor(100000 + Math.random() * 900000) + "";
//             var userPhone       = await User.findOne({PhoneNumber : MobileNumber});
//             if(userPhone){
//                 return res
//                 .status(HttpStatus.CONFLICT)
//                 .json({ message : "Username already exist" });
//             };
//             var userOtp         = await OtpModel.findOne({phoneNumer : MobileNumber });
//             if(userOtp){
//                 userOtp.otp     = RandomOTP.substring(2);
//                 userOtp.save();
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "OTP number is already existed" , userOtp})
//             }else
//             {
//                 const body          = {
//                     phoneNumer      : MobileNumber,
//                     otp             : RandomOTP.substring(2)
//                 };
//                 var Otp = await OtpModel.create(body);
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "number is created" , Otp})
//             }
//         }catch(err){
//             console.log(err)
//         }
//     },


//     async EditOTPNumber(req,res){
//         try{
//             const MobileNumber      = req.body.mobilenumber;
//             const PreviousNumber    = req.body.PreviousNumber;
//             var RandomOTP           = Math.floor(100000 + Math.random() * 900000) + "";
//             var userPhone           = await User.findOne({PhoneNumber : MobileNumber});
//             if(userPhone){
//                 return res
//                 .status(HttpStatus.CONFLICT)
//                 .json({ message : "Username already exist" });
//             };
//             var userOtp         = await OtpModel.findOne({phoneNumer : PreviousNumber });
//             userOtp.phoneNumer  = MobileNumber;
//             userOtp.otp         = RandomOTP.substring(2);
//             userOtp.save();
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "OTP number is changed and otp is" , userOtp});

//         }catch(err){
//             console.log(err)
//         }
//     },

//     async Verifyotp (req,res) {
//         try{
//             const OTP           = req.body.otp + "";
//             const MobileNumber  = req.body.mobilenumber + ""; 
//             var otp_modal       = await OtpModel.findOne({phoneNumer : MobileNumber , otp : OTP});
//             if(otp_modal){
//                 res.json({message : "OTP is Verified" , otp_modal})
//             }else{
//                 return res
//                 .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .json({message : "Incorrect OTP"});
//             }
//         }catch(err){
//             console.log(err)
//         }
//     },

//     async RegisterUser (req,res) {
//         try{
//             var Username    = req.body.username,
//                 Password    = req.body.password,
//                 PhoneNumber = req.body.phone;
//             var userPhone   = await User.findOne({PhoneNumber : PhoneNumber});
//             if(userPhone){
//                 return res
//                 .status(HttpStatus.CONFLICT)
//                 .json({ message : "MobileNumber already exist" });
//             };
//             return bcrypt.hash(Password , 13 , (err, hash) => {
//                 if(err){
//                     return res
//                         .status(HttpStatus.BAD_REQUEST)
//                         .json({ message : "Please enter valid password" })
//                 }
//                 const body = {
//                     PhoneNumber : PhoneNumber,
//                     Username    : Helpers.firstUpper(Username),
//                     Password    : hash
//                 };
//                 User.create(body).then(async user => {
//                     var token_user = await User.findById(user._id).select("Username").select("_id").select("ProfilePic").select("Longitude").select("Latitude");
//                     const token = jwt.sign({ data : token_user } , bdConfig.secret , {
//                         expiresIn : "1hr"
//                     });
//                     res.cookie("auth" , token);
//                     var otp_modal       = await OtpModel.findOne({phoneNumer : PhoneNumber});
//                     otp_modal.remove();
//                     return res
//                         .status(HttpStatus.CREATED)
//                         .json({ message : "User created successfully",token });
//                 }).catch(error => {
//                     return res
//                     .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .json({message : "Oops something went wrong"});
//                 });
//             });
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "Oops something went wrong"});
//         }
//     },

//     async LoginUser(req,res){
//         try{
//             const PhoneNumber   = req.body.phone;
//             const user          = await User.findOne({PhoneNumber : PhoneNumber}).select("_id").select("Username").select("ProfilePic").select("Longitude").select("Latitude");
//             const user2         = await User.findOne({PhoneNumber : PhoneNumber}).select("Password");
//                 if(!user){
//                     return res
//                     .status(HttpStatus.NOT_FOUND)
//                     .json({message : "Account not found"});
//                 }
//                 await bcrypt.compare(req.body.password , user2.Password).then((result) => {
//                     if(!result){
//                         return res
//                         .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                         .json({message : "Username or Password is incorrect"});
//                     }
//                     const token = jwt.sign({data : user } , bdConfig.secret , {
//                         expiresIn : "1hr"
//                     });
//                     res.cookie("auth" , token);
//                     return res
//                     .status(HttpStatus.OK)
//                     .json({ message : "Login Successfully" , token });
//             });
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "Unknown Error Occured"});
//         }
//     },

//     async ForgetPasswordOtpGenerate(req,res){
//         try{
//             var MobileNumber              = req.body.phoneNumer;
//             var RandomOTP                 = Math.floor(100000 + Math.random() * 900000) + "";
//             var userPhone                 = await User.findOne({PhoneNumber : MobileNumber}).select("-Password");
//             if(!userPhone){
//                 return res
//                 .status(HttpStatus.NOT_FOUND)
//                 .json({message : "Account not found or MobileNumber is Incorrect"});
//             }
//             userPhone.Forgot_Password_Otp = RandomOTP.substring(2);
//             userPhone.save();
//             return res
//             .status(HttpStatus.OK)
//             .json({ message : "OTP is Sent To Your Mobile Number" , userPhone });

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message :"Unknown Error Ooccured"});
//         }
//     },

//     async SubmitForgetPasswordOtp(req,res){
//         try{
//             var MobileNumber    = req.body.phoneNumer;
//             var otp             = req.body.otp;                 
//             var userPhone       = await User.findOne({PhoneNumber : MobileNumber}).select("-Password");
//             if(otp == userPhone.Forgot_Password_Otp){
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "OTP is Verified"})
//             }
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message :"OTP is Incorrect"});

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message :"Unknown Error Ooccured"});
//         }
//     },

//     async ChangePassword(req,res){
//         try{
//             var MobileNumber    = req.body.phoneNumer;
//             var otp             = req.body.otp;
//             var password        = req.body.password;
//             var user            = await User.findOne( { $and : [ { PhoneNumber : MobileNumber } , { Forgot_Password_Otp : otp } ] } );
//             if(!user){
//                 return res
//                 .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .json({message :"OTP is Incorrect"}); 
//             }
//             return bcrypt.hash(password , 13 , (err, hash) => {
//                 if(err){
//                     return res
//                     .status(HttpStatus.BAD_REQUEST)
//                     .json({ message : "Please enter valid password" })
//                 }
//                 user.Password = hash;
//                 user.save();
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "Password is Successfully Updated"});

//             });
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message :"Unknown Error Ooccured"});
//         }
//     },

//     async GetUserCart(req,res){
//         try{
//             var Present_Cart  = await Customer_Cart.findOne( { $and : [ { Owned_By : req.user._id} , { Cart_Purchased: false} ] } ).populate("Cart.Vegitable");
//             if(!Present_Cart){
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "You Haven't Purchased Anything"});
//             }
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "User cart is" , Present_Cart});

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message :"Unknown Error Ooccured"});
//         }
//     },

//     async GetUserInfo(req,res){
//         try{
//             var CurrentUser = await User.findById(req.user._id)
//             .select("-Password")
//             .select("-Prevoius_Carts")
//             .select("-Forgot_Password_Otp")
//             .select("-Prevoius_Cart")
//             .populate("Adderss.User_Address");
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "User is" ,CurrentUser});

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message :"Unknown Error Ooccured"});
//         }
//     },

//     async EditUserInfo(req,res){
//         try{
//             var Username    = req.body.body.Username;
//             var Email       = req.body.body.Email;
//             var Gender      = req.body.body.Gender;
//             var user        = await User.findById(req.user._id)
//             .select("-Password")
//             .select("-Prevoius_Carts")
//             .select("-Forgot_Password_Otp")
//             .select("-Prevoius_Cart")
//             .populate("Adderss.User_Address");
//             user.Username   = Username;
//             user.Email      = Email;
//             user.Gender     = Gender;
//             user.save();
//             const token = jwt.sign({data : user } , bdConfig.secret , {
//                 expiresIn : "1hr"
//             });
//             res.cookie("auth" , token);
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "Profile Updated" , user , token});
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "Unkown Error Occured"}); 
//         }
//     },

//     async UpdateDp(req,res){
//         try{
//             var user        = await User.findById(req.user._id);
//             if(user.ProfileId){
//                 await cloudinary.v2.uploader.destroy(user.ProfileId);
//                 user.ProfilePic = req.body.ImgUrl;
//                 user.ProfileId  = req.body.ImgId;
//                 await user.save();
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "Profile Updated"});
//             }
//             user.ProfilePic = req.body.ImgUrl;
//             user.ProfileId  = req.body.ImgId;
//             await user.save();
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "Profile Updated"});

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : err.message});
//         }
//     },  

//     async EditUserPhone(req,res){
//         try{
//             var Phonenumber         = req.body.number;
//             var existed_user        = await User.findOne({PhoneNumber : Phonenumber});
//             console.log(existed_user);
//             if(!existed_user){
//                 var user                = await User.findById(req.user._id)
//                 .select("-Password")
//                 .select("-Prevoius_Carts")
//                 .select("-Forgot_Password_Otp")
//                 .select("-Prevoius_Cart")
//                 .populate("Adderss.User_Address");
//                 var RandomOTP           = Math.floor(100000 + Math.random() * 900000) + "";
//                 // RandomOTP.substring(2);
//                 user.PhoneChange_Otp    = RandomOTP.substring(2);
//                 user.save();
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "OTP is Sent to Your Mobile Number" , user});
//             }
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "User Already Exist With This Mobile Number"});
            
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "Unkown Error Occured"}); 
//         }
//     },

//     async ChangePhoneNumber(req,res){
//         try{
//             var user                = await User.findById(req.user._id)
//             .select("-Password")
//             .select("-Prevoius_Carts")
//             .select("-Forgot_Password_Otp")
//             .select("-Prevoius_Cart")
//             .populate("Adderss","User_Address");
//             var otp                 = req.body.otp;
//             if(user.PhoneChange_Otp == otp){
//                 user.PhoneNumber = req.body.number;
//                 user.save();
//                 const token = jwt.sign({data : user } , bdConfig.secret , {
//                     expiresIn : "1hr"
//                 });
//                 res.cookie("auth" , token);
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "PhoneNumber Is Updated" , user , token}); 
//             }else{
//                 return res
//                 .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .json({message : "Incorrect OTP"}); 
//             }
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "Unkown Error Occured"});  
//         }
//     },

//     async SubmitAddress(req,res){
//         try{
//             var user            = await User.findById(req.user._id);
//             if(user.Adderss.length == 4){
//                 return res
//                 .status(HttpStatus.INSUFFICIENT_SPACE_ON_RESOURCE)
//                 .json({message : "You Cannot Add More Than Four Address"});
//             }
//             var new_address     = {
//                 Line1           : Helpers.firstUpper(req.body.body.Line1),
//                 Line2           : Helpers.firstUpper(req.body.body.Line2),
//                 City            : Helpers.firstUpper(req.body.body.City),
//                 State           : Helpers.firstUpper(req.body.body.State),
//                 Pincode         : req.body.body.Pincode,
//                 Landmark        : Helpers.firstUpper(req.body.body.Landmark),
//                 Area            : Helpers.firstUpper(req.body.body.Area)
//             };

//             var created_cart = await Address_Model.create(new_address);
//             var cartId       = {
//                 User_Address : created_cart._id
//             };

//             user.Adderss.push(cartId);
//             user.save();
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "Address is saved" }); 
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : err.message}); 
//         }
//     },

//     async EditAddress(req , res){
//         try{
//             var address         = await Address_Model.findById(req.body.addressId);
//             address.Line1       = Helpers.firstUpper(req.body.body.Line1);
//             address.Line2       = Helpers.firstUpper(req.body.body.Line2);
//             address.City        = Helpers.firstUpper(req.body.body.City);
//             address.State       = Helpers.firstUpper(req.body.body.State);
//             address.Pincode     = req.body.body.Pincode;
//             address.Landmark    = Helpers.firstUpper(req.body.body.Landmark);
//             Area                = Helpers.firstUpper(req.body.body.Area);
//             address.save();
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "Address Updated" });

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "Unkown Error Occured"});
//         }
//     },

//     async DeleteAddress(req,res){
//         try{
//             var user                = await User.findById(req.user._id)
//             .select("-Password")
//             .select("-Prevoius_Carts")
//             .select("-Forgot_Password_Otp")
//             .select("-Prevoius_Cart")
//             .populate("Adderss.User_Address");

//             user.Adderss.forEach(addres => {
//                 if(addres._id + "" == req.params.id + ""){
//                     addres.remove();
//                     user.save();
//                 }
//             });
//             var address_tobe_remove         = await Address_Model.findById(req.params.addressId);
//             address_tobe_remove.remove();
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "Address Deleted" , user});

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : err.message});
//         }
//     },

//     async CartPurchased(req,res){
//         try{
//             var user                    = await User.findById(req.user._id).populate("Present_Cart").select("-Password");
//             var cart                    = await Customer_Cart.findById(user.Present_Cart._id);
//             if(!cart.Cart_Purchased){
//                 cart.GrandTotal         = req.body.grandTotal;
//                 cart.Created            = new Date();
//                 cart.DeliveryAddress    = req.body.addressId;
//                 cart.Cart_Purchased     = true;
//                 cart.save();
//                 return res
//                 .status(HttpStatus.OK)
//                 .json({message : "Cart Is Purchased"});
//             }
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : "Your Cart Is Empty"});  
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : err.message});  
//         }
//     },

//     async GetUserPreviousCart(req,res){
//         try{
//             var Prevoius_Carts  = await Customer_Cart.find( { $and : [ { Owned_By : req.user._id} , { Cart_Purchased: true } ] } )
//             .populate("Cart.Vegitable")
//             .sort({ "Created" : -1 });
//             return res
//             .status(HttpStatus.OK)
//             .json({ Prevoius_Carts });
//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : err.message}); 
//         }
//     },

//     async SubmitUserLocation(req,res){
//         try{
//             var user            = await User.findById(req.user._id).select("-Password");
//             user.Longitude      = req.body.Longitude;
//             user.Latitude       = req.body.Latitude;
//             await user.save();
//             return res
//             .status(HttpStatus.OK)
//             .json({message : "Location Saved"});

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : err.message}); 
//         }
//     },

//     async GetUserById(req,res){
//         try{
//             var user = await User.findById(req.params.id).select("Username").select("_id").select("ProfilePic");
//             if(user){
//                 return res
//                 .status(HttpStatus.OK)
//                 .json(user)
//             }else{
//                 return res
//                 .status(HttpStatus.NOT_FOUND)
//                 .json({message : "User Not Found"})
//             }

//         }catch(err){
//             return res
//             .status(HttpStatus.INTERNAL_SERVER_ERROR)
//             .json({message : err.message}); 
//         }
//     }
// }




// client.messages 
            // .create({ 
            //     body: `Your farm to back otp is ${Otp.otp}`, 
            //     from: '+13345084837',       
            //     to: `+91${Otp.phoneNumer}` 
            // }) 
            // .then(message => res.json({message : "OTP is sent to your mobile number" , Otp})) 
            // .done();
