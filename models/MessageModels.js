const mongoose =  require("mongoose");

const MessageSchema = mongoose.Schema({
    conversationId  : { type : mongoose.Schema.Types.ObjectId , ref : "Conversation" },
    sender          : { type : String },
    receiver        : { type : String },
    totalMessages   : { type : Number , default : 1 },
    message         : [
        {
            senderId        : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" }, 
            receiverId      : { type : mongoose.Schema.Types.ObjectId , ref : "UserModel" },
            sendername      : { type : String },
            receivername    : { type : String },
            body            : { type : String },
            isRead          : { type : Boolean , default : false },
            createdAt       : { type : Date , default : Date.now() }
        }
    ]
});

module.exports = mongoose.model("Message" , MessageSchema)