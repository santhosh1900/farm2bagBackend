module.exports = function(io , User , _) {
    const user = new User();
    io.on("connection" , socket=>{
        socket.on("refresh" , data=>{
            io.emit("refreshPage" , {})
        });

        socket.on("online" , data => {
            socket.join(data.room);
            user.EnterRoom(socket.id , data.user , data.room);
            const list = user.GetList(data.room);
            io.emit("usersOnline" , _.uniq(list))
        });

        socket.on("disconnect" , () => {
            const disconnected_User = user.RemoveUser(socket.id);
            if(disconnected_User){
                const userArray = user.GetList(disconnected_User.room);
                const arr = _.uniq(userArray)
                _.remove(arr , n => n === disconnected_User.name);
                io.emit("usersOnline" ,arr)
            }
        })
    });
};