const User = require("../models/UserModels");

module.exports = {
    firstUpper : (username) => {
        const name = username.toLowerCase();
        return name.charAt(0).toUpperCase() + name.slice(1)
    },

    lowerCase : (str) => str.toLowerCase(),

    updateChatList : async (req,msg) => {
        try{
            await User.updateOne({
                _id : req.user._id
            } , { $pull : {
                    chatList : {
                        receiverId : req.params.receiverId 
                    }
                }
            });
            
            await User.updateOne({
                _id :  req.params.receiverId
            } , { $pull : {
                    chatList : {
                        receiverId : req.user._id 
                    }
                }
            });
    
            await User.updateOne({
                _id : req.user._id
            } , { $push : {
                    chatList : {
                        $each : [
                            {
                                receiverId : req.params.receiverId,
                                msgId      : msg._id
                            }
                        ],
                        $position : 0
                    }
                }
            });
    
            await User.updateOne({
                _id : req.params.receiverId
            },{ $push : {
                    chatList : {
                        $each : [
                            {
                                receiverId : req.user._id,
                                msgId      : msg._id
                            }
                        ],
                        $position : 0
                    }
                }
            });
        }
        catch(err){
            console.log(err)
        }
    }
}