const HttpStatus    = require("http-status-codes"),
      Message       = require("../models/MessageModels"),
      Conversation  = require("../models/ConversationModels"),
      User          = require("../models/UserModels"),
      Helpers       = require("../Helpers/helpers");


module.exports = {
    async GetAllMessages(req,res){
        try{
            const sender_Id     = req.params.senderId;
            const receiver_Id   = req.params.receiverId;
            const conversation  = await Conversation.findOne({
                $or: [
                     { $and : [{"participants.senderId" : sender_Id} , {"participants.receiverId" : receiver_Id}] },
                     { $and : [{"participants.senderId" : receiver_Id} , {"participants.receiverId" : sender_Id}] }
                    ]
            }).select("_id");
            if(conversation) {
                // const messages = await Message.findOne({conversationId  : conversation._id}).select("message");
                const messages = await Message.findOne({conversationId  : conversation._id});
                // messages.message.skip((10 * 1) - 1).limit(5);
                res.status(HttpStatus.OK).json({Message : "Message returned" , messages})
            }else{
                return res.status(HttpStatus.OK).json({Message : "No Converstion Yet"});
            }
        }catch(err){
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message : "Error Occured"})
        }
        
    },

    SendMessage(req,res){
        const sender_Id     = req.params.senderId;
        const receiver_Id   = req.params.receiverId;
        Conversation.find({
            $or : [
                {participants : { $elemMatch : { senderId : sender_Id , receiverId : receiver_Id }}},
                {participants : { $elemMatch : { senderId : receiver_Id , receiverId : sender_Id }}},
            ]
        }, async (err , result) =>{
            try{
                if(result.length > 0){
                    const new_message = {
                            senderId        : req.user._id,
                            receiverId      : req.params.receiverId,
                            sendername      : req.user.Username,
                            receivername    : req.body.receiverName,
                            body            : req.body.message,
                            createdAt       : new Date()
                    }
                    const msg = await Message.findOne({conversationId : result[0]._id });
                    Helpers.updateChatList(req,msg);
                    await Message.updateOne({
                        conversationId : result[0]._id 
                    },
                    {
                        $push : {
                            message : new_message
                        },
                        $inc : { totalMessages : 1 }
                    }).then(() => res.status(HttpStatus.OK).json({message : "message Sent Successfully" , new_message}))
                    .catch(err => {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message : "Error Occured"})
                    })
                }
                else{
                    const newConversation = new Conversation();
                    newConversation.participants.push({
                        senderId    : req.user._id,
                        receiverId  : req.params.receiverId
                    });
                    const savedConversation = await newConversation.save();
                    newMessage = new Message();
                    newMessage.conversationId   = savedConversation._id;
                    newMessage.sender           = req.user.Username;
                    newMessage.receiver         = req.body.receiverName;
                    newMessage.message.push({
                        senderId        : req.user._id,
                        receiverId      : req.params.receiverId,
                        sendername      : req.user.Username,
                        receivername    : req.body.receiverName,
                        body            : req.body.message,
                        createdAt       : new Date()
                    });
                    await newMessage.save()

                    await User.updateOne({
                        _id : req.user._id
                    },{
                        $push : {
                            chatList : {
                                $each : [
                                    {
                                        receiverId : req.params.receiverId,
                                        msgId      : newMessage._id
                                    }
                                ],
                                $position : 0
                            }
                        }
                    });

                    await User.updateOne({
                        _id : req.params.receiverId
                    },{
                        $push : {
                            chatList : {
                                $each : [
                                    {
                                        receiverId : req.user._id,
                                        msgId      : newMessage._id
                                    }
                                ],
                                $position : 0
                            }
                        }
                    });
                    res.status(HttpStatus.OK).json({message : "Message Sent"})
                }
            }
            catch(err){
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message : "Error Occured"})
            }
        })
    },

    async MarkReceiverMessages(req,res) {
        try{
            const {sender , receiver}  = req.params;
            const msg  = await Message.aggregate([
                { $unwind : "$message" },
                {
                    $match : {
                        $and : [
                            { "message.sendername" : receiver , "message.receivername" : sender }
                        ]
                    }
                }
            ]);
            if(msg.length > 0){
                try{
                    msg.forEach(async (value) => {
                        await Message.updateOne(
                        {
                            "message._id" : value.message._id
                        },
                        { $set : { "message.$.isRead" : true } }
                        );
                    });
                    res.status(HttpStatus.OK).json({message : "Message marked as read"});
                }
                catch(err){
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message : "Error occured"});
                }
            }
        }
        catch(err){
            console.log(err)
        }
        
    },

    async MarkAllMessages(req,res){
        try{
            const msg  = await Message.aggregate([
                { $match : { "message.receivername" : req.user.username } },
                { $unwind : "$message" },
                { $match : { "message.receivername" : req.user.username } },
            ]);
            if(msg.length > 0){
                try{
                    msg.forEach(async (value) => {
                        await Message.updateOne(
                        {
                            "message._id" : value.message._id
                        },
                        { $set : { "message.$.isRead" : true } }
                        );
                    });
                    res.status(HttpStatus.OK).json({message : "Message marked as read"});
                }
                catch(err){
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message : "Error occured"});
                }
            }
        }
        catch(err){
            console.log(err)
        }
        
    }


}