const express           = require("express"),
      mongoose          = require("mongoose"),
      PORT              = process.env.PORT || 3000;
      app               = express(),
      {MONGOURI}        = require("./key"),
      bodyParser        = require("body-parser"),
      cookieParser      = require("cookie-parser"),
      route             = require("./routes/vegitable"),
      user_route        = require("./routes/User"),
      server_route      = require("./routes/ServerSide"),
      ad_route          = require("./routes/Advertisement"),
      Comment_route     = require("./routes/Comment"),
      Message_route     = require("./routes/Message"),
      logger            = require("morgan"),
      cors              = require("cors"),
      _                 = require("lodash");


//io config
app.use(cors());

const server            = require("http").createServer(app);

const io = require("socket.io")(server, {
    cors: {
      credentials: true,
      methods: ["GET"],
      origin: '*',
      optionsSuccessStatus: 200,
    },
    allowEIO3: true,
});
      

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

const { User }  = require("./Helpers/UserClass");

app.use(express.json({ limit : "50mb" }));

app.use(express.urlencoded({ extended : true  , limit : "50mb"}));

// app.use(express.static(__dirname+"/public"));



mongoose.Promise        = global.Promise;
mongoose.connect(MONGOURI,{
    useNewUrlParser: true,
    useCreateIndex : true,
    useUnifiedTopology: true,
    useFindAndModify : false	
}).then(() =>{
    console.log("connected to db cluster");
}).catch(err =>{
    console.log("error",err.message);
});  

app.get("/" , (req,res) => {
    res.json({message : "Nothing to view here"});
})




io.on("connection" , socket=>{
    socket.on("create_room" , (data) => {
        socket.join(data.room);
    });

    socket.on("start_typing" , data=>{
        io.to(data.receivername).emit("is_typing",data);
    });

    socket.on("stop_typing" , data=>{
        io.to(data.receivername).emit("has_stopped_typing",data);
    });

    socket.on("send_new_message" , data=>{
        io.to(data.receiverId).emit("message_received",data);
    });
});


app.use(route); 
app.use(user_route);
app.use(server_route);
app.use(ad_route);
app.use(Comment_route);
app.use(Message_route);



server.listen(PORT,()=>{
    console.log("server is running in port" ,PORT);
});