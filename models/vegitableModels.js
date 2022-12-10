const mongoose          = require("mongoose");

const vegetableSchema = mongoose.Schema({
    name            : String,
    image           : String,
    tamilName       : String,
    description     : String,
    farm            : { type : mongoose.Schema.Types.ObjectId , ref : "Farm" },
    location        : { type : mongoose.Schema.Types.ObjectId , ref : "Location" },
    quantity        : Number,
    strikePrice     : Number,
    actualPrice     : Number,
    type            : String,
    note            : String,
    weight          : String,
    location_name   : String
});

module.exports = mongoose.model("Vegetable" , vegetableSchema);