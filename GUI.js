class BaseCanvas{
    //canvasの抽象クラス
    //これを継承して具体的なクラスを作る
    constructor(ctx, pos, w, h){
        this.ctx = ctx;
        this.pos = pos;
        this.w = w;
        this.h = h;
    }
    update(user){
        this.clicked = user.clicked;
        this.rel = user.mouse.sub(this.pos); //マウスの相対位置
        this.center = new Point(this.w / 2, this.h / 2); //canvasの中心
        this.abs_center = this.center.add(this.pos); //canvasの絶対中心

    }
    draw(){
        //canvasの描画（オーバーライド用）

    }
    // post_processing(){
    //     //後処理を担当。
    //
    // }

    contains_mouse(){
        //このcanvasの中にマウスカーソルがあるか
        return 0 <= this.rel.x && this.rel.x <= this.w
                    && 0 <= this.rel.y && this.rel.y <= this.h
    }
}


var ColorInfo = {
    forBoard : {
        NONE : "white",
        BLUE : "blue",
        RED : "red",
        GREEN : "green",
        YELLOW : "yellow"
    }
};

class GameCanvas extends BaseCanvas{
    //ゲームをまとめるcanvasクラス
    //個々のcanvasを持つ
    constructor(game, ctx, pos, w, h){
        super(ctx, pos, w, h); //親のコンストラクタを呼ぶ
        this.game = game;
        var board_pos = new Point(100, 50); //ボードの相対位置、幅、高さ
        var board_w = 700;
        var board_h = 700;
        this.boardcanvas = new BoardCanvas(this.game.board, this.ctx, board_pos, board_w, board_h);
        this.all_canvas = [];
        this.all_canvas.push(this.boardcanvas); //ここにcanvasを詰め込む
        // var piece_pos = new Point(V)
        // this.piececanvas = new PieceCanvas(this.game.players, this.ctx, piece_pos, piece_w, piece_h);
    }
    update(user){
        //drawする前にユーザーの操作を処理するための関数
        //小さいcanvasにupdateを伝播させる
        super.update(user);

        for(let canvas of this.all_canvas){
            canvas.update(user);
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
    //ボードを表示するためのcanvasクラス
    constructor(board, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.board = board;
        this.ip_cursor = new IPoint(-1000, -1000, -1000); //マウスのボード座標系表示
    }
    update(user){
        super.update(user);
        if(this.contains_mouse()){
            // console.log(this.rel);
            var _ijk = this.where_ijk();
            // ifj
            this.ip_cursor = _ijk
            if(this.board.on_board(_ijk) && user.clicked){
                // this.board.blocks[_ijk.i][_ijk.j][_ijk.k] = 1;
                var te = new Te(_ijk, new Piece(0, true, Color.YELLOW), 0, 0);
                if(this.board.can_put(te)) this.board.put(te);
            }
            // console.log(_ijk);
        }else{
            this.ip_cursor = new IPoint(-1000, -1000, -1000);
        }
    }
    draw(){
        this.ctx.fillStyle = "skyblue";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        var size = 20;
        this.tri_size = size;
        this.vi = new Point(0, 1).multiply(size);
        this.vj = new Point(-sqrt(3)/2, -1/2).multiply(size);
        this.vk = new Point(+sqrt(3)/2, -1/2).multiply(size);
        var vi = this.vi; var vj = this.vj; var vk = this.vk;
        //点の描画（確認用）
        for(let point of this.board.points){
            var relp = this.vi.multiply(point[0]).add(this.vj.multiply(point[1]).add(this.vk.multiply(point[2])));
            this.ctx.fillStyle = "black";
            this.ctx.beginPath();
            this.ctx.arc(this.abs_center.add(relp).x, this.abs_center.add(relp).y, 2, 0, 2*PI);
            if(point[0] == 0 && point[1] == 0 && point[2] == 0){
                this.ctx.arc(this.abs_center.add(relp).x, this.abs_center.add(relp).y, 4, 0, 2*PI);
            }
            this.ctx.fill();
        }
        //三角形の描画
        for(let triangle of this.board.triangles){
            var color = this.board.blocks[triangle[0]][triangle[1]][triangle[2]];
            this.draw_triangle(IPoint.from_arr(triangle), ColorInfo.forBoard[S_Color[color]]);
        }
        //カーソルは盤上にマウスが来たときのみ表示
        if(this.board.on_board(this.ip_cursor)){
            this.draw_triangle(this.ip_cursor, "red");
        }
    }

    draw_triangle(ip, color){
        //ボード座標系の三角形に色を付ける
        var ps = ip.get_points_around_triangle();
        var relps = [];
        for(let point of ps){
            var relp = this.vi.multiply(point.i).add(this.vj.multiply(point.j).add(this.vk.multiply(point.k)));
            relps.push(relp);
        }
        relps = Point.change_ratio_triangle(0.8, relps);
        var absps = [];
        for(let relp of relps){
            absps.push(relp.add(this.abs_center));
        }
        // console.log(color);
        // console.log(ColorInfo.forBoard[S_Color[color]]);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(absps[0].x, absps[0].y);
        this.ctx.lineTo(absps[1].x, absps[1].y);
        this.ctx.lineTo(absps[2].x, absps[2].y);
        this.ctx.closePath();
        this.ctx.fill();

    }

    // draw_piec

    where_ijk(){
        //マウスの位置からボード座標系への変換
        //updateの後に呼ばれなければならない
        var p = this.rel.sub(this.center);
        var tri_h = this.tri_size * 3 / 2;
        var _i = floor(p.y / tri_h);
        var vj = new Point(-sqrt(3)/2, -1/2);
        var vk = new Point(+sqrt(3)/2, -1/2);
        var _j = floor(p.dot(vj) / tri_h);
        var _k = floor(p.dot(vk) / tri_h);
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
    //駒台のcanvasクラス
    constructor(players, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.players = player;
    }
}
