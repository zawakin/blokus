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
            this.players[i] = new Player(i);
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

    }
    next(){
        if(this.state == State.STARTED){
            this.wait(this.turn);

            this.turn = this.turn % n_player + 1;
            if(!this.is_continue()){
                this.state = State.FINISHED;
            }
        }else{
            console.log("game finished");
        }
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
    canput_some_piece_on(board){
        //可能な手を列挙する
        return true;
    }
    put(te,board){
        board.put(te);
    }
    think(board){
        var te = new Te();
    }

}

class Te{
    constructor(pos, piece, rotation, n_pivot){
        this.pos = pos;
        this.piece = piece;
        this.rotation = rotation;
        this.n_pivot = n_pivot;
    }

}


var Color = {NONE : 0, BLUE:1, RED:2, GREEN:3, YELLOW:4};
var Direction = {UP : 0, DOWN : 1};

class Board{
    constructor(size, n_player){
        this.size = size;
        this.blocks = {};
        this.clear()
    }

    put(te){
        // for(let cell of piece.)
    }

    clear(){
        for(var i=0; i < this.size; i++){
            this.blocks[i] = {};
            this.blocks[2*this.size-i-1] = {};
            for(var j=-i; j <= 2*this.size+i; j++){
                console.log(i,j);
                this.blocks[i][j] = new Block(i, j);
                this.blocks[2*this.size-i-1][j] = new Block(2*this.size-i-1, j);
            }
        }

    }

    print(){
        var s = "";
        for(var i=0; i<2*this.size; i++){
            for(var j=-this.size; j<=2*this.size+this.size; j++){
                // console.log(i,j,typeof(this.blocks[i][j]));
                // console.log(this.blocks[i][j]);
                if(typeof(this.blocks[i][j]) != "undefined"){
                    s += this.blocks[i][j].color ;
                }else{
                    s += "-";
                }
            }
            s += "\n";
        }
        console.log(s);

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

var BASE_PieceSet = [
    [[0,0,Direction.UP],
     [1,0,Direction.DOWN],
     [1,1,Direction.UP]]
];
var PieceSet = BASE_PieceSet;

function deepCopy(arr2d){
    var L = arr2d.length;
    var res = [];
    for(var i=0; i<L; i++){
        var res2 = [];
        for(var j=0; j<arr2d[i].length; j++){
            res2.push(arr2d[i][j]);
        }
    }
    return res;
}

class IPoint{
    constructor(i, j, k){
        this.i = i;
        this.j = j;
        this.k = k;
    }
    is_point(){
        return this.sum() == 0;
    }
    is_forward_triangle(){
        return this.sum() == 1;
    }
    is_backward_triangle(){
        return this.sum() == -1;
    }
    is_triangle(){
        return this.sum() == 1 || this.sum() == -1;
    }
    rotate(){
        return new IPoint(k, i, j);
    }
    add(ip){
        return new IPoint(this.i+ip.i, this.j+ip.j, this.k+ip.k);
    }
    sum(){
        return this.i + this.j + this.k;
    }

}

class Piece{
    constructor(num, alive){
        this.alive = alive;
        this.num = num;
        this.content = deepCopy(PieceSet[num]);
        this.len = this.content.length;
    }

    rotate(n_times, n_pivot){


    }

    rotate_index(i, j, direction){
        if(direction == Direction.UP){
            var leftj = floor(j/2) + j % 2;
            var upi =
        }
    }

    center_offset(n_pivot){
        var res = deepCopy(this.content);
        var pivot = res[n_pivot];
        for(var i=0; i < this.len; i++){
            for(var j=0; j <= 1; j++){
                res[i, j] -= pivot[j]
            }
        }
        this.content = res;
    }

}
