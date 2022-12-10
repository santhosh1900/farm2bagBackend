const helpers = require("../Helpers/helpers");

const express            = require("express"),
      router             = express.Router(),
      Helper             = require("../Helpers/ServerHelper"),
      ServerCtrl         = require("../controllers/server");

router.get("/allorders" , Helper.VerifyAdmin , ServerCtrl.GetAllOrders);




module.exports = router;