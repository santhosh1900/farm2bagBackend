const express       = require("express"),
      router        = express.Router(),
      vegitables     = require("../models/vegitableModels"),
      locations      = require("../models/locationModels"),
      farms          = require("../models/farmModels"),
      Helper         = require("../Helpers/AuthHeper");
      Customer_Cart  = require("../models/PresentCartModels"),
      User           = require("../models/UserModels"),
      _              = require("lodash");


const { INTERNAL_SERVER_ERROR, OK } = require("http-status-codes");
const HttpStatus        = require("http-status-codes");


router.get("/allveges", Helper.VerifyHeader ,async(req,res)=>{
    try{
        var allveges = await vegitables.find({location_name : req.query.location}).populate("farm","name").populate("location","name");
        var allfarms = await farms.find({ location_name :  req.query.location });
        return res.json({allveges , allfarms})
    }catch(err){
       return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message : "Unknown Error Occured "});     }
});

router.post("/addtocart" , Helper.VerifyToken , async(req,res)=>{
    try{
        const product_id    = req.body.id;
        const vegetable     = await vegitables.findById(product_id);
        const Customer      = await User.findById(req.user._id).populate("Present_Cart");
        if(vegetable.quantity <= 0){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Out Of Stock"});
        };
        if(!Customer.Present_Cart || Customer.Present_Cart.Cart_Purchased ){
            var cart_body = {
                Cart : [{
                    Vegitable : vegetable,
                    Quantity  : 1
                }],
                Owned_By : Customer._id,
                Created  : new Date(),
                Location : vegetable.location_name
            };
            var Present_Cart            = await Customer_Cart.create(cart_body);
            Customer.Present_Cart       = Present_Cart._id;
            await Customer.save();
            return res.json({message : "Item is Successfully added to the cart" , Present_Cart});
        }
        else{
            var Present_Cart            = await Customer_Cart.findById(Customer.Present_Cart).populate("Cart.Vegitable");
            var new_item_present        = true;
            if(!!Present_Cart.Cart[0] == true && Present_Cart.Cart[0].Vegitable.farm + "" != vegetable.farm._id + ""){
                return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message : "You Cannot Buy Products From Different Farm Or Location"}); 
            }
            for(let i of Present_Cart.Cart){
                if(i.Vegitable._id + "" == vegetable._id + ""){
                    new_item_present = false;
                    if(i.Quantity < 5){
                        i.Quantity++;
                        Present_Cart.save();
                        return res.json({message : "Item is Successfully added to the cart" , Present_Cart}); 
                    }
                    else{
                        return res
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({message : "You cannot add same item more than 5 times"}); 
                    }
                }
            }
            if(new_item_present){
                const new_item = {
                    Vegitable : vegetable,
                    Quantity  : 1 
                };
                Present_Cart.Cart.push(new_item);
                Present_Cart.save();
                return res.json({message : "Item is Successfully added to the cart" , Present_Cart});
            }
        }
        
    }catch(err){
       return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message : "Unknown Error Occured "});     }
});


router.post("/removefromcart" , Helper.VerifyToken , async (req,res)=>{
    try{
        const Customer = await User.findById(req.user._id).populate("Present_Cart");
        var item_id    = req.body.item_id;
        if(Customer.Present_Cart || !Customer.Present_Cart.Cart_Purchased){
            const Present_Cart = await Customer_Cart.findById(Customer.Present_Cart._id).populate("Cart.Vegitable");
            Present_Cart.Cart.forEach(item => {
                if(item._id + "" == item_id + ""){
                    item.remove();
                    Present_Cart.save();
                }
            });
            return res.json({message : "Item is Successfully removed from  the cart" , Present_Cart});
        }
    }catch(err){
       return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message : "Unknown Error Occured "});     }
});


router.get("/productInfo/:id" ,  Helper.VerifyHeader , async(req,res)=>{
    try{
        const product = await vegitables.findById(req.params.id).populate("farm").populate("location");
        const allProducts = await vegitables.find({type : product.type , location_name : product.location_name}).populate("farm","name").populate("location","name");
        return res.json({message : "Item Info" , product , allProducts});
    }catch(err){
       return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message : "Unknown Error Occured "}); 
    }
});

router.put("/productedit" ,  Helper.VerifyToken , async(req,res)=>{
    try{
        const Customer      = await User.findById(req.user._id);
        const CustomerCart = await Customer_Cart.findById(Customer.Present_Cart);
        const product_id    = req.body.item_id;

        if(Customer.Present_Cart.Cart_Purchased || !Customer.Present_Cart ){
            return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({message : "Unknown Error Occured "}); 
        }
        for(item of CustomerCart.Cart){
            if(item._id == product_id){
                const vegetable     = await vegitables.findById(item.Vegitable).select("quantity");
                if(vegetable.quantity <= Number(req.body.quantity)){
                    return res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({message : "Sorry Sir Product Is Out Of Stock"});
                };
                item.Quantity = req.body.quantity;
                CustomerCart.save();
                return res
                .status(HttpStatus.OK)
                .json({message : "item is updated"})
            }
        }
    }catch(err){
       return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message : "Unknown Error Occured "});     
    }
});

router.post("/search-veges" , Helper.VerifyHeader , async(req,res)=>{
    try{
        let VegiPattern = new RegExp("^" + req.body.query);
        var veges       = await vegitables.find({ name : {$regex : VegiPattern} , location_name : req.body.locationName })
        .populate("farm")
        .select("_id")
        .select("image")
        .select("actualPrice")
        .select("name")
        .select("tamilName");

        return res
        .status(HttpStatus.OK)
        .json(veges);
    }catch(err){
        return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message : "Unknown Error Occured "});   
    }
});




// var Present_Cart = await Customer_Cart.findById(Customer.Present_Cart);
//             console.log(Present_Cart);
//             _.remove(Present_Cart.Cart , (item)=>{
//                 return item.Vegitable + "" == vegetable._id + "" 
//             });
//             console.log("item is removed");
//             Present_Cart.save();


module.exports = router;