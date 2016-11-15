var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static("public"));
app.set("port", (process.env.PORT || 5000));

app.get("/", function (req, res) {
    res.sendFile("index.html");
});

io.on("connection", (socket)=>{

});

http.listen(app.get("port"), ()=>{
    console.log(`port = ${app.get("port")}`);
});
