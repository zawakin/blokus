var State = {
    BEFORE : 0,
    STARTED : 1,
    FINISHED : 2
};
var Color = {
    NONE : 0,
    BLUE:1,
    RED:2,
    GREEN:3,
    YELLOW:4
};
var Direction = {UP : 0, DOWN : 1};

function swap_key_value(dict){
    var values = Object.values(dict);
    var keys = Object.keys(dict);
    var res = {};
    for(var i=0; i<keys.length; i++){
        res[values[i]] = keys[i];
    }
    return res;
}
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

var S_State = swap_key_value(State);
var S_Color = swap_key_value(Color);
var S_Direction = swap_key_value(Direction);

class Game{
    constructor(size, n_player){
        this.board = new Board(size, n_player);
        this.n_player = n_player;
        this.players = [];
        for(var i=0; i < n_player; i++){
            this.players.push(new Player(i+1));
        }
        this.state = State.BEFORE;
    }
    start(){
        console.log("game start");
        for(let player of this.players){
            player.initialize(this.n_player);
        }
        this.state = State.STARTED;
        this.turn = Color.BLUE;

    }
    next(te){
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
        console.log("State : " + S_State[this.state]);
        console.log("turn : " + S_Color[this.turn]);


    }
}

class Player{
    constructor(color){
        this.color = color;
    }
    initialize(n_player){
        this.pieces = Piece.copy_from_original_all();
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
    constructor(piece, rotation, pivot){

    }
}


class Board{
    constructor(size){
        this.size = size;
        this.triangles = [];
        this.points = [];
        // this.blocks = {};
        // kthis.clear()
        this.init();
    }
    init(){
        this.blocks = {};
        this.indexs = [];
        for(var i=-this.size; i<=this.size; i++){
            for(var j=-this.size; j<=this.size; j++){
                for(var k=-this.size; k<=this.size; k++){
                    var p = new IPoint(i, j, k);
                    if(i != this.size && j != this.size && k != this.size){
                        if(p.sum() == -2){
                            this.triangles.push([i+1,j+1,k+1]);
                        }else if(p.sum() == -1){
                            this.triangles.push([i, j, k]);
                        }

                    }
                    if(p.is_point()){
                        this.points.push([i, j, k]);
                    }
                }
            }
        }
    }

    put(te){
        // for(let cell of piece.)
    }

    clear(){
    }

    print(){
    }
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
    rotate(n){
        switch(n%3){
            case 0:
                return this.copy();
            case 1:
                return new IPoint(this.k, this.i, this.j);
            case 2:
                return new IPoint(this.j, this.k, this.i);
        }
        console.log("error[001]");
    }
    add(ip){
        return new IPoint(this.i+ip.i, this.j+ip.j, this.k+ip.k);
    }
    sub(ip){
        return new IPoint(this.i-ip.i, this.j-ip.j, this.k-ip.k);
    }
    sub_scalar(s){
        return new IPoint(this.i-s, this.j-s, this.k-s);
    }
    sum(){
        return this.i + this.j + this.k;
    }
    copy(){
        return new IPoint(this.i, this.j, this.k);
    }
    equals(ip){
        return this.i == ip.i && this.j == ip.j && this.k == ip.k;
    }
    get_points_around_triangle(){
        var s = this.sum();
        var ps = [];
        ps.push(new IPoint(this.i-s, this.j, this.k));
        ps.push(new IPoint(this.i, this.j-s, this.k));
        ps.push(new IPoint(this.i, this.j, this.k-s));
        return ps;
    }
    static One(){
        return new IPoint(1, 1, 1);
    }
    static Zero(){
        return new IPoint(0, 0, 0);
    }
    static from_arr(arr){
        return new IPoint(arr[0], arr[1], arr[2]);
    }

}

var BasePieceSet = [
    [[0,0,1],[1,0,0],[0,1,0]]
];
var PieceSet = [];
for(var i=0; i < BasePieceSet.length; i++){
    var piece = [];
    for(var j=0; j < BasePieceSet[i].length; j++){
        piece.push(IPoint.from_arr(BasePieceSet[i][j]));
    }
    PieceSet.push(piece);
}


class Piece{
    constructor(num, alive, color){
        this.alive = alive;
        this.num = num;
        this.content = Piece.copy_from_original_content(this.num);
        this.color = color;
    }

    rotate(n_times, n_pivot){
        var pivot = this.content[n_pivot];
        if(pivot.is_forward_triangle()){
            var center = new IPoint(pivot.i-1, pivot.j, pivot.k);
            var offset = new IPoint(1, -1, 0);
        }else if(pivot.is_backward_triangle()){
            var center = new IPoint(pivot.i+1, pivot.j, pivot.k);
            var offset = new IPoint(-1, 1, 0);
        }else{
            console.log("pivot is invalid.");
        }
        for(var i=0; i < this.content.length; i++){
            this.content[i] = this.content[i].sub(center).rotate(n_times)
                            .add(center).add(offset);
        }
    }

    static copy_from_original_content(num){
        var piece = [];
        for(var i=0; i < PieceSet[num].length; i++){
            piece.push(PieceSet[num][i].copy());
        }
        return piece;
    }
    static copy_from_original_all(alive, color){
        var pieces = [];
        for(var i=0; i < PieceSet.length; i++){
            pieces.push(new Piece(i, true, color));
        }
        return pieces;
    }
}
