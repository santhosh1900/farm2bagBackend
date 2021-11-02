const mongoose          = require("mongoose");

const LocationSchema = mongoose.Schema({
    name            : String,
    farms           : [
                        { 
                            farm : {type : mongoose.Schema.Types.ObjectId , ref : "Farm"}
                        }
                ],
    vegetables      : [
                        { 
                            vegetable : { type : mongoose.Schema.Types.ObjectId , ref : "Vegetable" }
                        }
                ],
})

module.exports = mongoose.model("Location" , LocationSchema);