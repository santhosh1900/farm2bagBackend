const express       = require("express"),
      router        = express.Router(),
      MessageCtrl    = require("../controllers/Message"),
      AuthHelper    = require("../Helpers/AuthHeper");

router.get("/chat-message/:senderId/:receiverId" , AuthHelper.VerifyToken , MessageCtrl.GetAllMessages);

router.post("/chat-message/:senderId/:receiverId" , AuthHelper.VerifyToken , MessageCtrl.SendMessage);

router.get("/receiver-message/:sender/:receiver", AuthHelper.VerifyToken , MessageCtrl.MarkReceiverMessages);
      
router.post("/mark-all-messsages", AuthHelper.VerifyToken , MessageCtrl.MarkAllMessages);
      

      
      
module.exports = router;