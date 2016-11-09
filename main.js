$(function(){
    // console.log($("#cnvs"));
    //
    var ctx = $("#cnvs")[0].getContext("2d");    //
    var mouse = new Point(0, 0);

    var game = new Game(9, 4);
    game.start();
    game.print();
    console.log(game.board.triangles);

    var gamecanvas = new GameCanvas(game, ctx, new Point(0, 0), 1000, 800);

    $("#cnvs").mousemove((e)=>{

        mouse = new Point(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop);
        // console.log(mouse);
        // render(mouse);
    });
    // var test_piece = new Piece([[0,0],[1,0]])
    // $("#cnvs").click(e=>{
    //     var bkey = game.board.which_block(mouse);
    //     if(bkey != -1){
    //         console.log(game.board.blocks[bkey].color);
    //         game.put(bkey, test_piece);
    //         console.log(game.board.blocks[bkey].color);
    //     }
    // });
    function render(){
        // console.log("hoge" + mouse);

        gamecanvas.update(mouse);
        gamecanvas.draw();
    }

    setInterval(render, 100);
    // game.board.print();hoge
    // console.log(game.boahogerd.blocks[1]);hogehogehogehogehoge

    // var board = new Board(2, new Point(300,100), 80, ctx);

});
