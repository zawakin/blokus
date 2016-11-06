var State = {
    BEFORE : 0,
    STARTED : 1,
    FINISHED : 2
};
class Game{
    constructor(size, n_player){
        this.board = new Board(size, n_player);
        this.n_player = n_player;
        this.players = {};
        for(var i=1; i < n_player; i++){
            this.players[i] = new Player(color);
        }
        this.state = State.BEFORE;
    }
    start(){
        console.log("game start");
        for(let player of this.players){
            player.initilize(n_player);
        }
        this.state = State.STARTED;
        this.turn = Color.BLUE;
        while(this.state == State.STARTED){
            this.wait(this.turn);

            this.turn = this.turn % n_player + 1;
            if(!this.is_continue){
                this.state = State.FINISHED;
            }
        }
        console.log("game finished");
    }
    wait(color){
        var player = this.players[color];
        if(player.canput_some_piece(this.board)){
            player.put(this.board);
        }else{
            console.log("skip");
        }
    }
    is_continue(){
        return true;
    }
    print(){
        console.log("State : " + this.state);
        console.log("turn : " + this.turn);
    }
}

class Player{
    constructor(color){
        this.color = color;
    }
    initialize(n_player){
        this.pieces = Piece.InitialPieces(n_player);
    }
    canput_some_piece(board){
        //可能な手を列挙する
        return true;
    }
    put(board){
        //通信して手を取得する
        var te = new Te();

    }
    think(board){
        var te = new Te();
    }

}

class Te{
    constructor(piece, rotation, pivot){
        this.piece =
    }

}

var Color = {NONE : 0, BLUE:1, RED:2, GREEN:3, YELLOW:4};
var Direction = {UP : 0, DOWN : 1};

class Board{
    constructor(size, n_player){
        this.size = size;
        this.blocks = {};
        for(var i=0; i <= 2*this.size; i++){
            this.blocks[i] = {};
            for(var j=-i; j <= 2*size+1; j++){
                this.blocks[i][j] = new Block(i, j);
            }
        }
    }

    print(){

    }
}

class Block{
    constructor(_i, _j){
        this.i = _i;
        this.j = _j;
        this.direction = (this.i + this.j) % 2;
        this.color = Color.NONE;
    }
}

class Piece{
    constructor(num, alive){
        this.alive = alive;
        this.num = num;
    }
}
