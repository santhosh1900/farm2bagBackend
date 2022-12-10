// const helpers = require("../Helpers/helpers");

const express            = require("express"),
      router             = express.Router(),
      Helper             = require("../Helpers/AuthHeper"),
      AdCtrl             = require("../controllers/ad");


router.get("/getuserads" , Helper.VerifyToken , AdCtrl.GetUserAds);  

router.post("/submitfarmerad" , Helper.VerifyToken , AdCtrl.PostFarmerAd);

router.post("/submitwholesalead" , Helper.VerifyToken , AdCtrl.PostWholesaleAd);

router.delete("/deletefarmerad" , Helper.VerifyToken , AdCtrl.DeleteFarmerAdd);

router.delete("/deletewholesalead" , Helper.VerifyToken , AdCtrl.DeleteWoleSaleAd);

router.get("/getFarmad" , Helper.VerifyToken , AdCtrl.GetFarmerAd);

router.get("/getwholesalead" , Helper.VerifyToken , AdCtrl.GetWholesaleAd);

router.put("/updatefarmad" , Helper.VerifyToken , AdCtrl.EditFarmerAd);

router.put("/updatewholesaleadposter" , Helper.VerifyToken , AdCtrl.UpdateWholesaleAdPoster);

router.put("/updatewholesaleadadproff" , Helper.VerifyToken , AdCtrl.UpdateWholesaleAdAddessProff);

router.put("/updatewholesaleadvideo" , Helper.VerifyToken , AdCtrl.UpdateWholesaleAdVideo);

router.put("/updatewholesalead" , Helper.VerifyToken , AdCtrl.UpdateWholesaleAd);

router.get("/getallfarmerads/:location" , Helper.VerifyToken , AdCtrl.GetAllFarmersAds);

router.get("/getallwholesaleads/:location" , Helper.VerifyToken , AdCtrl.GetAllWholesaleAds);

router.post("/addfarmerview" , Helper.VerifyToken , AdCtrl.AddFarmerViews);

router.post("/addwholesaleview" , Helper.VerifyToken , AdCtrl.AddWholesaleViews);






module.exports = router;