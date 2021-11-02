const express            = require("express"),
      router             = express.Router(),
      AuthCtrl           = require("../controllers/auth");
      Helper             = require("../Helpers/AuthHeper");
 
      
router.post("/sendotp"  , Helper.VerifyHeader ,  AuthCtrl.CtreateOtp);

router.post("/EditNumber" , Helper.VerifyHeader ,  AuthCtrl.EditOTPNumber);

router.post("/verifyotp" , Helper.VerifyHeader ,  AuthCtrl.Verifyotp);

router.post("/registeruser" , Helper.VerifyHeader ,  AuthCtrl.RegisterUser);

router.post("/login" , Helper.VerifyHeader ,  AuthCtrl.LoginUser);

router.post("/forgotpasswordotpgenerate" , Helper.VerifyHeader ,  AuthCtrl.ForgetPasswordOtpGenerate);

router.post("/submitforgotpasswordotp" , Helper.VerifyHeader ,  AuthCtrl.SubmitForgetPasswordOtp);

router.post("/changepassword" , Helper.VerifyHeader ,  AuthCtrl.ChangePassword);

router.get("/usercart" , Helper.VerifyToken , AuthCtrl.GetUserCart);

router.get("/userinfo" , Helper.VerifyToken , AuthCtrl.GetUserInfo);

router.put("/edituserinfo" , Helper.VerifyToken , AuthCtrl.EditUserInfo);

router.post("/edituserphone" , Helper.VerifyToken , AuthCtrl.EditUserPhone);

router.put("/changephonenumber" , Helper.VerifyToken , AuthCtrl.ChangePhoneNumber);

router.post("/submitaddress" , Helper.VerifyToken , AuthCtrl.SubmitAddress);

router.put("/editadress" , Helper.VerifyToken , AuthCtrl.EditAddress);

router.delete("/deleteaddress/:addressId/:id" , Helper.VerifyToken , AuthCtrl.DeleteAddress);

router.post("/cartpurchased" , Helper.VerifyToken , AuthCtrl.CartPurchased);

router.get("/previouscart" , Helper.VerifyToken , AuthCtrl.GetUserPreviousCart);

router.put("/updatedp" , Helper.VerifyToken , AuthCtrl.UpdateDp);

router.put("/submitlocation" , Helper.VerifyToken , AuthCtrl.SubmitUserLocation);

router.get("/getuserbyid/:id" , Helper.VerifyHeader , AuthCtrl.GetUserById);




module.exports = router;