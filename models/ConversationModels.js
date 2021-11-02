const mongoose =  require("mongoose");

const ConversationSchema = mongoose.Schema({
    participants : [
        {
            senderId    : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel"},
            receiverId  : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel"}, 
        }
    ]
});

module.exports = mongoose.model("Conversation" , ConversationSchema);