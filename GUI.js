class BaseCanvas{
    constructor(ctx, pos, w, h){
        this.ctx = ctx;
        this.pos = pos;
        this.w = w;
        this.h = h;
    }
    update(mouse){
        this.rel = mouse.sub(this.pos);
        this.center = new Point(this.w / 2, this.h / 2);
        this.abs_center = this.center.add(this.pos);
    }
    draw(){

    }
    contains_mouse(){
        return 0 <= this.rel.x && this.rel.x <= this.w
                    && 0 <= this.rel.y && this.rel.y <= this.h
    }
}

class GameCanvas extends BaseCanvas{
    constructor(game, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.game = game;
        var board_pos = new Point(100, 50);
        var board_w = 700;
        var board_h = 700;
        this.boardcanvas = new BoardCanvas(this.game.board, this.ctx, board_pos, board_w, board_h);
        this.all_canvas = [];
        this.all_canvas.push(this.boardcanvas);
        // var piece_pos = new Point(V)
        // this.piececanvas = new PieceCanvas(this.game.players, this.ctx, piece_pos, piece_w, piece_h);
    }
    update(mouse){
        this.mouse = mouse;
        for(let canvas of this.all_canvas){
            canvas.update(mouse);
        }
    }
    draw(){
        this.ctx.clearRect(this.pos.x, this.pos.y, this.w, this.h);
        this.ctx.fillStyle = "orange";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        for(let canvas of this.all_canvas){
            canvas.draw();
        }
    }

}

class BoardCanvas extends BaseCanvas{
    constructor(board, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.board = board;
    }
    update(mouse){
        super.update(mouse);
        if(this.contains_mouse()){
            // console.log(this.rel);
            var _ijk = this.where_ijk();
            // console.log(_ijk);
        }
    }
    draw(){
        this.ctx.fillStyle = "skyblue";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        var size = 20;
        this.tri_size = size;
        var vi = new Point(0, 1).multiply(size);
        var vj = new Point(-sqrt(3)/2, -1/2).multiply(size);
        var vk = new Point(+sqrt(3)/2, -1/2).multiply(size);
        for(let point of this.board.points){
            var relp = vi.multiply(point[0]).add(vj.multiply(point[1]).add(vk.multiply(point[2])));
            this.ctx.fillStyle = "black";
            this.ctx.beginPath();
            this.ctx.arc(this.abs_center.add(relp).x, this.abs_center.add(relp).y, 2, 0, 2*PI);
            if(point[0] == 0 && point[1] == 0 && point[2] == 0){
                this.ctx.arc(this.abs_center.add(relp).x, this.abs_center.add(relp).y, 4, 0, 2*PI);
            }
            this.ctx.fill();
        }
        for(let triangle of this.board.triangles){
            var ps = IPoint.from_arr(triangle).get_points_around_triangle();
            var relps = [];
            for(let point of ps){
                var relp = vi.multiply(point.i).add(vj.multiply(point.j).add(vk.multiply(point.k)));
                relps.push(relp);
            }
            relps = Point.change_ratio_triangle(0.8, relps);
            var absps = [];
            for(let relp of relps){
                absps.push(relp.add(this.abs_center));
            }
            this.ctx.fillStyle = "white";
            this.ctx.beginPath();
            this.ctx.moveTo(absps[0].x, absps[0].y);
            this.ctx.lineTo(absps[1].x, absps[1].y);
            this.ctx.lineTo(absps[2].x, absps[2].y);
            this.ctx.closePath();
            this.ctx.fill();

        }
    }

    where_ijk(){
        var p = this.rel.sub(this.center);
        // var tri_h = sqrt(3) / 2 * this.tri_size;
        var tri_h = this.tri_size * 3 / 2;
        var _i = floor(p.y / tri_h);
        var vj = new Point(-sqrt(3)/2, -1/2);
        var vk = new Point(+sqrt(3)/2, -1/2);
        var _j = floor(p.dot(vj) / tri_h);
        var _k = floor(p.dot(vk) / tri_h);
        // console.log(p);
        // console.log(tri_h);
        // console.log(p.y, tri_h, _i);
        // console.log(vj);
        var res = new IPoint(_i, _j, _k);
        if(res.sum() == -2){
            //三角形を３本の直線が作ると考えたときには順方向の三角形は過小評価される
            //それぞれのインデックスを一ずつ足す
            res = res.add(IPoint.One());
        }
        // console.log(res);
        $("#debug").text("("+res.i+", "+ res.j + ", "+ res.k + ") sum = " + res.sum());
        return res;

    }

}

class PieceCanvas extends BaseCanvas{
    constructor(players, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.players = player;
    }
}
