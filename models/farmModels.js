const mongoose          = require("mongoose");

const FarmSchema = mongoose.Schema({
    name            : String,
    location        : { type : mongoose.Schema.Types.ObjectId , ref : "Location" },
    vegetables      : [{ vegetable : { type : mongoose.Schema.Types.ObjectId , ref : "Vegetable" }}],
    location_name   : String
})

module.exports = mongoose.model("Farm" , FarmSchema);