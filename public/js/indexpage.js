// import $ from "jquery";
let socket = io();

let ROOMSTATE = {
    EMPTY: 0,
    WAITING: 1,
    BATTLE: 2,
    BATTLEFINISH: 3
}

let PAGE = {
    INDEX : 0,
    BATTLE : 1
};


let roomNum = 100;

let roomElements = [];


onload = function(){
    console.log("onload");
	var List = document.getElementById("roomList");

	for (var i = 1; i <= roomNum; i++) {
	    var room = document.createElement("li");
	    room.className = "list-group-item";
	    room.innerHTML = "<a href=\"game?r=" + i + "\">" + i + " : "+ "取得中" + "</a>";
	    roomElements[i] = room;
	    List.appendChild(room);
	}

	socket.emit("givemerooms",{});
    socket.emit("wherepage", {
        page : PAGE.INDEX,
    });

};

socket.on("allroomstate",function(rooms){
  for(let i=1; i<=100; i++){
    let room = rooms[i];
    let txt;
	switch(room.state){
  		case ROOMSTATE.EMPTY:
  			txt = "空室";
  			break;
  		case ROOMSTATE.WAITING:
  			txt = room.waitingname + "　対戦待ち";
  			break;
  		case ROOMSTATE.BATTLE:
  			txt = "対戦中";
  			break;
  		case ROOMSTATE.BATTLEFINISH:
  	// 		txt = vstxt + "　感想戦";
  			break;

  	}
    let ihtml = `<a href='/game?r=${room.N}'>${room.N} ${txt}</a>`;
 //  	let ihtml = "<a href=\"game?r=" + room.N + "\">" + room.N + " : "+ txt + "</a>";
    // console.log($(roomElements[room.N]));
  	$(roomElements[room.N]).html(ihtml);
  }
});

socket.on("roomstatechange",function(room){
  var txt;
	switch(room.state){
		case ROOMSTATE.EMPTY:
			txt = "空室";
			break;
		case ROOMSTATE.WAITING:
			txt = room.waitingname + "　対戦待ち";
			break;
		case ROOMSTATE.BATTLE:
			txt = vstxt + "　対戦中";
			break;
		case ROOMSTATE.BATTLEFINISH:
			txt = vstxt + "　感想戦";
			break;

	}
	var ihtml = "<a href=\"game?r=" + room.N + "\">" + room.N + " : "+ txt + "</a>";
	$(roomElements[room.N]).html(ihtml);


});
