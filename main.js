$(function(){

    var ctx = $("#cnvs")[0].getContext("2d");
    var mouse = new Point(0, 0);

    var game = new Game(9, 4);
    game.start();

    var gamecanvas = new GameCanvas(game, ctx, new Point(0, 0), 1000, 800);
    
    $("#cnvs").mousemove((e)=>{

        mouse = new Point(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop);
    });
    function render(){
        gamecanvas.update(mouse);
        gamecanvas.draw();
    }

    // render();
    setInterval(render, 100);
});
