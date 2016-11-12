$(function(){

    let ctx = $("#cnvs")[0].getContext("2d");
    function init_user(){
        let user_base = {
            mouse : new Point(0, 0),
            clicked : false,
            wheel : 0
        }
        return user_base;
    }
    let user = init_user();
    let mouse = new Point(0, 0);

    let game = new Game(9, 4);
    game.start();

    let gamecanvas = new GameCanvas(game, ctx, new Point(0, 0), 1000, 800);

    $("#cnvs").mousemove((e)=>{

        user.mouse = new Point(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop);
    });

    $("#cnvs").click(e=>{
        user.clicked = true;

    });

    $("#cnvs").mousewheel((eo, delta, deltaX, deltaY)=>{
        user.wheel = delta;
        console.log(delta, deltaX, deltaY);
    });
    function render(){
        gamecanvas.update(user);
        gamecanvas.draw();
        // user = init_user();
        user.clicked = false;
        user.wheel = 0;
    }



    setInterval(render, 10);
});
