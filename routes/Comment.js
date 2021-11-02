const express            = require("express"),
      router             = express.Router(),
      Helper             = require("../Helpers/AuthHeper"),
      CommentCtrl        = require("../controllers/Comment_Report");

router.post("/postfarmadcomment" , Helper.VerifyToken , CommentCtrl.PostFarmAdComment);

router.post("/postwholesaleadcomment" , Helper.VerifyToken , CommentCtrl.PostWholesaleAdComment);

router.get("/getallfarmeradcomments/:Id" , Helper.VerifyToken , CommentCtrl.GetAllFarmersAdComments);

router.get("/getallwholesaleadcomments/:Id" , Helper.VerifyToken , CommentCtrl.GetAllWholesaleAdComments);

router.put("/updatecomment" , Helper.VerifyToken  , CommentCtrl.UpdateComment);

router.delete("/deletefarmadcomment/:CommentId/:UserId/:FarmAdId" , Helper.VerifyToken  , CommentCtrl.DeleteFarmerAdComment);

router.delete("/deletewholesaleadcomment/:CommentId/:UserId/:WholesaleAdId" , Helper.VerifyToken  , CommentCtrl.DeleteWholesaleAdComment);







module.exports = router;