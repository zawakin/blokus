let express = require("express");
let app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http);
let ejs = require("ejs");
let cookieSession = require("cookie-session");

// let bodyParser = require("body-parser");
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extend : true,
//     limit : "50mb"
// }));
// app.use(express.static("public"));
app.set("trust proxy", 1);
app.use(cookieSession({
    name : "session",
    keys : ["key"]
}));

app.use(express.static(__dirname + "/public"));
app.set("port", (process.env.PORT || 5000));


// app.engine("ejs", ejs.renderFile);
app.get("/", function (req, res) {
    res.sendFile("index.html");
});

app.get("/game", (req, res)=>{
    let query = req.query.r;
    // req.session.views = (req.session.views || 0) + 1;
    req.session.roomNum = req.query.r;
    // res.send(req.session.roomNum);
    res.sendFile(__dirname + "/public/battle.html");

});

app.get("/cookie", (req, res)=>{
    console.log(req.session.roomNum);
    res.send(req.session.roomNum);
});

io.on("connection", (socket)=>{
    console.log("connected.");
    socket.on("wherepage", (res)=>{
        socket.page = res.page;
    });
    socket.on("givemerooms",function(){
        console.log("givemerooms received.");
		mng.SendRoomState(socket);
	});
    socket.on("whereroom", roomNum=>{
        socket.page = PAGE.BATTLE;
        socket.roomNum = roomNum;
        console.log(socket.roomNum);
    });
});
var ROOMSTATE = {
    EMPTY : 0,
    WAITING : 1,
    BATTLE : 2,
    BATTLEFINISH : 3
};

let PAGE = {
    INDEX : 0,
    BATTLE : 1
};

class Client{
    constructor(socket){
        this.socket = socket;
        this.id = this.socket.id;

    }
}
class Room{
    constructor(num){
        this.roomNum = num;
        this.clientList = [];
        this.state = ROOMSTATE.EMPTY;

    }
    Init(){
        this.clientList = [];
    }
    StateChange(state){
        this.state = state;
        this.MsgToServer("state changed");
        // io.emit("roomstatechange", this.GetSendableState());
    }
    MsgToServer(msg){
        console.log(`room : ${this.roomNum} ${msg}`);
    }
    GetSendableState(){
        let room = {
            N : this.roomNum,
            state : this.state
        };
        return room;
    }
}


class Manager{
    constructor(num){
        this.rooms = [];
        this.roomNum = num;
        for(let i=1; i <= this.roomNum; i++){
            this.rooms[i] = new Room(i);
        }
    }
    SendRoomState(socket){
    var rooms = [];
        for(let i=1;i<=this.roomNum;i++){
            rooms[i] = this.rooms[i].GetSendableState();
        }
      socket.emit("allroomstate",rooms);
    }
}

let mng = new Manager(100);

http.listen(app.get("port"), ()=>{
    console.log(`port = ${app.get("port")}`);
});
