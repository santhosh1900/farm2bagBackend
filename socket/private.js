module.exports = function(io) {
    io.on("connection" , socket=>{
        socket.on("join_chat" , (params)=> {
            socket.join(params.room1);
            socket.join(params.room2);
        });

        socket.on("start_typing" , data=>{
            io.to(data.receivername).emit("is_typing",data);
        });

        socket.on("stop_typing" , data=>{
            io.to(data.receivername).emit("has_stopped_typing",data);
        });

        socket.on("send_new_message" , data=>{
            console.log(data)
            io.to(data.receivername).emit("message_received",data);
        });
    });
};