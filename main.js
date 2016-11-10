$(function(){

    var ctx = $("#cnvs")[0].getContext("2d");
    function init_user(){
        var user_base = {
            mouse : new Point(0, 0),
            clicked : false
        }
        return user_base;
    }
    var user = init_user();
    var mouse = new Point(0, 0);

    var game = new Game(9, 4);
    game.start();

    var gamecanvas = new GameCanvas(game, ctx, new Point(0, 0), 1000, 800);

    $("#cnvs").mousemove((e)=>{

        user.mouse = new Point(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop);
    });

    $("#cnvs").click(e=>{
        user.clicked = true;

    });
    function render(){
        gamecanvas.update(user);
        gamecanvas.draw();
        // user = init_user();
        user.clicked = false;
    }

    setInterval(render, 10);
});
