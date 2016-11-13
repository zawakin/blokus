$(function(){

    const ctx = $("#cnvs")[0].getContext("2d");
    function init_user(){
        let user_base = {
            mouse : new Point(0, 0),
            clicked : false,
            wheel : 0,
            mousedown : false, //これらはイベントであり状態ではない
            mouseup : false,
            keycodes : []
        }
        return user_base;
    }
    let user = init_user();
    let mouse = new Point(0, 0);

    let game = new Game(9, 4);
    game.start();

    let my_color = Color.BLUE;
    let gamecanvas = new GameCanvas(game, ctx, new Point(0, 0), 1200, 1000, my_color);

    $("")
    $("#cnvs").mousemove((e)=>{

        user.mouse = new Point(e.pageX-e.target.offsetLeft, e.pageY-e.target.offsetTop);
    });

    $("#cnvs").click(e=>{
        user.clicked = true;

    });

    $("#debugbox").append("<h2 id='drag'>a</h2>");
    $("#cnvs").mousedown((e)=>{
        e.preventDefault();
        user.mousedown = true;
    });

    $("#cnvs").hover(e=>{;}, e=>{
        user.mouseup = true;
    });

    $("#cnvs").mouseup((e)=>{
        user.mouseup = true;
    });

    $("#cnvs").mousewheel((eo, delta, deltaX, deltaY)=>{
        eo.preventDefault();
        user.wheel = delta;
        console.log(delta, deltaX, deltaY);
    });
    function render(){
        gamecanvas.update(user);
        gamecanvas.draw();
        // user = init_user();
        user.clicked = false;
        user.wheel = 0;
        user.mousedown = false;
        user.mouseup = false;
    }

    console.log(game.board.triangles);

    setInterval(render, 10);
});
