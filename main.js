$(function(){
    console.log($("#cnvs"));

    var ctx = $("#cnvs")[0].getContext("2d");

    var mouse = new Point(-1,-1);

    var game = new Game(2, 4, new Point(300,100), 80, ctx);

    $("#cnvs").mousemove((e)=>{
        mouse.set(e.pageX, e.pageY);
        // console.log(mouse);
        render(mouse);
    });
    var test_piece = new Piece([[0,0],[1,0]])
    $("#cnvs").click(e=>{
        var bkey = game.board.which_block(mouse);
        if(bkey != -1){
            console.log(game.board.blocks[bkey].color);
            game.put(bkey, test_piece);
            console.log(game.board.blocks[bkey].color);
        }
    });

    function render(){
        game.update(mouse);
    }

    // var board = new Board(2, new Point(300,100), 80, ctx);

});
