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
        this.user = user;
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
        let board_pos = new Point(100, 50); //ボードの相対位置、幅、高さ
        let board_w = 700;
        let board_h = 700;
        this.boardcanvas = new BoardCanvas(this.game.board, this.ctx, board_pos, board_w, board_h);
        this.all_canvas = [];
        this.all_canvas.push(this.boardcanvas); //ここにcanvasを詰め込む

        this.testcanvas = new TestCanvas(this.ctx, new Point(300,300), 300, 300);
        this.all_canvas.push(this.testcanvas)

        // let piece_pos = new Point(V)
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
        this.selected = false;
        this._rot = 0;
    }
    update(user){
        super.update(user);
        if(this.contains_mouse()){
            // console.log(this.rel);
            let _ijk = this.where_ijk();
            // ifj
            this.ip_cursor = _ijk
            if(this.board.on_board(_ijk)){
                this.te = new Te(_ijk, new Piece(0, true, Color.YELLOW), this._rot, 1);
                this.selected = true;
            }
            if(this.board.on_board(_ijk) && user.wheel != 0){
                this._rot += user.wheel;
                console.log(this._rot);
                // this.board.blocks[_ijk.i][_ijk.j][_ijk.k] = 1;

                // console.log(te.slided_content);
                // if(this.board.can_put(te)) this.board.put(te);
            }
            // console.log(_ijk);
        }else{
            this.ip_cursor = new IPoint(-1000, -1000, -1000);
        }
    }
    draw(){
        this.ctx.fillStyle = "skyblue";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        let size = 20;
        this.tri_size = size;
        this.vi = new Point(0, 1).multiply(size);
        this.vj = new Point(-sqrt(3)/2, -1/2).multiply(size);
        this.vk = new Point(+sqrt(3)/2, -1/2).multiply(size);
        let vi = this.vi; let vj = this.vj; let vk = this.vk;
        //点の描画（確認用）
        for(let point of this.board.points){
            let relp = this.vi.multiply(point[0]).add(this.vj.multiply(point[1]).add(this.vk.multiply(point[2])));
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
            let color = this.board.blocks[triangle[0]][triangle[1]][triangle[2]];
            this.draw_triangle(IPoint.from_arr(triangle), ColorInfo.forBoard[S_Color[color]]);
        }
        //カーソルは盤上にマウスが来たときのみ表示
        if(this.board.on_board(this.ip_cursor)){
            this.draw_triangle(this.ip_cursor, "red");
        }
        if(this.selected && this.board.can_put(this.te)){
            for(let ip of this.te.slided_content){
                this.draw_triangle(ip, "blue");
            }
        }
    }

    draw_triangle(ip, color){
        //ボード座標系の三角形に色を付ける
        let ps = ip.get_points_around_triangle();
        let relps = [];
        for(let point of ps){
            let relp = this.vi.multiply(point.i).add(this.vj.multiply(point.j).add(this.vk.multiply(point.k)));
            relps.push(relp);
        }
        relps = Point.change_ratio_triangle(0.8, relps);
        let absps = [];
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
        let p = this.rel.sub(this.center);
        let tri_h = this.tri_size * 3 / 2;
        let _i = floor(p.y / tri_h);
        let vj = new Point(-sqrt(3)/2, -1/2);
        let vk = new Point(+sqrt(3)/2, -1/2);
        let _j = floor(p.dot(vj) / tri_h);
        let _k = floor(p.dot(vk) / tri_h);
        let res = new IPoint(_i, _j, _k);
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

class KomadaiCanvas extends BaseCanvas{
    //駒台のcanvasクラス
    constructor(players, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.players = player;
    }
}

class PieceCanvas extends BaseCanvas{
    constructor(piece, nrot_30, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.piece = piece;
        this.nrot_30 = nrot_30;
    }
    update(user){
        super.update(user);
    }
    contains_mouse(){

    }

}

class TestCanvas extends BaseCanvas{
    constructor(ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.dragging = false;
    }
    update(user){
        super.update(user);
        $("#drag").text(`${this.user.mousedown} ${this.contains_mouse()}`)

        if(this.dragging && this.user.mousedown){
            this.dragging = false;
        }else{
            if(this.user.mousedown && this.contains_mouse()){
                //ドラッグの開始
                this.dragging = true;
                this.rel_before = this.rel.copy();
            }else{
                if(this.dragging){
                    // console.log(this.rel_before);
                    this.pos = this.pos.add(this.rel.sub(this.rel_before));
                }
            }
            if(this.dragging && this.user.mouseup){
                this.dragging = false;
            }
        }
        this.user.mousedown = false;
        this.user.mouseup = false;
    }
    draw(){
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
    }
    // contains_mouse(){
    //
    // }
}
