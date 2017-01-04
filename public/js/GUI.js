class BaseCanvas{
    //canvasの抽象クラス
    //これを継承して具体的なクラスを作る
    constructor(ctx, pos, w, h){
        this.ctx = ctx;
        this.pos = pos;
        this.w = w;
        this.h = h;
        this.draggable = true;
        this.dragging = false;
        this.dropped = false;
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

    available_drag(flag){
        this.draggable = flag;
    }
    drag(){
        if(!this.draggable) return
        {
            if(this.user.mousedown){
                if(this.contains_mouse()){
                    this.dragging = true;
                    this.rel_before = this.rel.copy();
                    return true;
                }else{
                    // this.dragging = false;
                }
            }else if(this.user.mouseup){
                // console.log("mouseup");
                if(this.dragging){
                    this.dropped = true;
                }
                this.dragging = false;
            }else{
                if(this.dragging){
                    this.pos = this.pos.add(this.rel.sub(this.rel_before));
                    this.update(this.user);
                    this.drag_update(this.user);
                }
            }
        }
        return false;
    }
    drag_update(user){

    }
    drop(){
        //dropしたあとはdroppedをfalseにする
    }

    contains_mouse(){
        //このcanvasの中にマウスカーソルがあるか
        return 0 <= this.rel.x && this.rel.x <= this.w
                    && 0 <= this.rel.y && this.rel.y <= this.h
    }
    where_ijk(tri_size){
            let p = this.rel.sub(this.center);
            let tri_h = tri_size * 3 / 2;
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
            return res;
    }
}


var ColorInfo = {
    gameboard : "rgba(175, 134, 134, 1)",
    boardcanvas : "#a5adb4",
    forBoard : {
        NONE : "rgb(130, 135, 130)",
        BLUE : "rgba(0,0,255,0.9)",
        RED : "rgba(255,0,0,0.9)",
        GREEN : "rgba(0, 255, 0, 0.96)",
        YELLOW : "rgba(250, 250, 14, 1)"
    },
    forKomadai : {
        NONE : "gray",
        BLUE : "rgba(111, 111, 241, 0.8)",
        RED : "rgba(241, 105, 105, 0.8)",
        GREEN : "rgba(129, 237, 129, 0.8)",
        YELLOW : "rgba(246, 246, 105, 0.8)"

    }
};


class GameCanvas extends BaseCanvas{
    //ゲームをまとめるcanvasクラス
    //個々のcanvasを持つ
    constructor(game, ctx, pos, w, h, my_color){
        super(ctx, pos, w, h); //親のコンストラクタを呼ぶ
        this.game = game;
        this.my_color = my_color;
        let board_pos = new Point(100, 50); //ボードの相対位置、幅、高さ
        let board_w = 600;
        let board_h = 600;

        this.all_canvas = [];
        this.boardcanvas = new BoardCanvas(this.game.board, this.ctx, board_pos, board_w, board_h);
        this.all_canvas.push(this.boardcanvas); //ここにcanvasを詰め込む

        console.log(this.game.n_player);
        let sukima = 5 / 500 * this.boardcanvas.w;
        let komadai_h = (this.boardcanvas.h - 2 * sukima) / 3;
        let komadai_w = this.boardcanvas.w / 2;
        let piece_h = komadai_h / 5;
        let piece_w = komadai_w / 5 * 2 /3;
        let piece_size = 21 / 700 * board_w;
        for(let i=1; i<this.game.n_player; i++){
            let color = (my_color + i - 1) % this.game.n_player + 1;
            let player = this.game.players[color - 1];
            let x0 = this.boardcanvas.pos.x + this.boardcanvas.w + 10;
            let y0 = this.boardcanvas.pos.y;
            let h = komadai_h;
            let w = komadai_w;
            let pos = new Point(x0, y0+(h+sukima)*(i-1));
            let kc = new KomadaiCanvas(this.game, color, this.ctx, pos, w, h);
            this.all_canvas.push(kc);
            for(let j=0; j<player.pieces_alive.length; j++){
                // let base = new Point(sukima, sukima);
                let offset = new Point(piece_w+sukima, 0);
                let piece = player.pieces_alive[j];
                // let offset = new Point(100, 0);
                let nw = floor(w / offset.x);
                let ni = imod(j, nw);
                let nj = floor(j / nw);
                let offset2 = new Point(offset.x*ni, piece_w*nj);
                let pc = new PieceCanvas(piece, 0, this.ctx, pos.add(offset2),
                                        piece_w, piece_h, piece_size/3);
                kc.piececanvases.push(pc);
                this.all_canvas.push(pc);
            }


        }
        let my_pos = this.boardcanvas.pos.add(new Point(0, this.boardcanvas.h + 10));
        let my_w = this.boardcanvas.w + 10 + komadai_w;
        let my_h = this.boardcanvas.w / 3;
        let kc = new MyKomadaiCanvas(this.game, this.my_color, this.ctx, my_pos, my_w, my_h);
        this.all_canvas.push(kc);
        this.mykomadaicanvas = kc;
        for(let j=0; j<this.game.players[my_color-1].pieces_alive.length; j++){
            let base = new Point(sukima, sukima*3);
            let offset = new Point(piece_w*2+sukima, 0);
            let nw = floor(my_w / offset.x);
            let ni = imod(j, nw);
            let nj = floor(j / nw);
            let offset2 = new Point(offset.x*ni, piece_h*2*nj);
            let piece = this.game.players[my_color-1].pieces_alive[j];
            let pc = new PieceCanvas(piece, 0, this.ctx, my_pos.add(offset2).add(base),
                                    my_w / 10, my_h / 5, piece_size);
            kc.piececanvases.push(pc);
            this.all_canvas.push(pc);
        }


    }
    update(user){
        //drawする前にユーザーの操作を処理するための関数
        //小さいcanvasにupdateを伝播させる
        super.update(user);

        for(let canvas of this.all_canvas){
            canvas.update(user);
        }

        for(let i=this.all_canvas.length-1; i>=0; i--){
            let canvas = this.all_canvas[i];
            if(canvas.drag()) break;
            if(canvas.dropped){
                this.drop(canvas);
            }
        }

        // this.mykomadaicanvas
        for(let piece of this.mykomadaicanvas.piececanvases){
            piece.tri_size = this.boardcanvas.tri_size;
        }

    }
    draw(){
        this.ctx.clearRect(this.pos.x, this.pos.y, this.w, this.h);
        this.ctx.fillStyle = ColorInfo.gameboard;
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        this.ctx.lineWidth = 5.0;
        this.ctx.strokeRect(this.pos.x, this.pos.y, this.w, this.h);
        for(let canvas of this.all_canvas){
            canvas.draw();
        }
    }
    drop(canvas){
        let dx = 0;
        let dy = 0;
        if(canvas.pos.x < this.pos.x) dx = this.pos.x - canvas.pos.x + 3;
        if(canvas.pos.y < this.pos.y) dy = this.pos.y - canvas.pos.y + 3;
        if(canvas.pos.x + canvas.w > this.pos.x + this.w) dx = this.pos.x + this.w - (canvas.pos.x + canvas.w) - 3;
        if(canvas.pos.y + canvas.h > this.pos.y + this.h) dy = this.pos.y + this.h - (canvas.pos.y + canvas.h) - 3;
        canvas.pos = canvas.pos.add(new Point(dx, dy));
        canvas.dropped = false;
        canvas.drop();

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
            }else{
                // this.selected = false;
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
        let size = 21 / 700 * this.w;
        this.tri_size = size;
    }
    draw(){
        let size = this.tri_size;
        this.ctx.fillStyle = ColorInfo.boardcanvas;
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        this.ctx.lineWidth = 5.0;
        this.ctx.strokeRect(this.pos.x, this.pos.y, this.w, this.h);
        this.vi = new Point(0, 1).multiply(size);
        this.vj = new Point(-sqrt(3)/2, -1/2).multiply(size);
        this.vk = new Point(+sqrt(3)/2, -1/2).multiply(size);
        let vi = this.vi; let vj = this.vj; let vk = this.vk;
        // 点の描画（確認用）
        for(let point of this.board.points){
            let relp = this.vi.multiply(point[0]).add(this.vj.multiply(point[1]).add(this.vk.multiply(point[2])));
            this.ctx.fillStyle = "black";

            this.ctx.beginPath();
            // this.ctx.arc(this.abs_center.add(relp).x, this.abs_center.add(relp).y, 2, 0, 2*PI);
            if(point[0] == 0 && point[1] == 0 && point[2] == 0){
                this.ctx.arc(this.abs_center.add(relp).x, this.abs_center.add(relp).y, 4, 0, 2*PI);
            }
            this.ctx.fill();
        }
        //三角形の描画
        for(let triangle of this.board.triangles){
            let color = this.board.blocks[triangle[0]][triangle[1]][triangle[2]];
            this.draw_triangle(IPoint.from_arr(triangle), ColorInfo.forBoard[S_Color[color]], color!=Color.NONE);
        }
        // カー,ソルは盤上にマウスが来たときのみ表示
        if(this.board.on_board(this.ip_cursor)){
            this.draw_triangle(this.ip_cursor, "red");
        }
        // if(this.selected && this.board.can_put(this.te)){
        //     for(let ip of this.te.slided_content){
        //         this.draw_triangle(ip, "blue", true);
        //     }
        // }
    }

    draw_triangle(ip, color, larger){
        //ボード座標系の三角形に色を付ける
        let ps = ip.get_points_around_triangle();
        let relps = [];
        for(let point of ps){
            let relp = this.vi.multiply(point.i).add(this.vj.multiply(point.j).add(this.vk.multiply(point.k)));
            relps.push(relp);
        }
        let alpha = 0.8;
        if(larger) alpha = 0.9;
        relps = Point.change_ratio_triangle(alpha, relps);
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
        this.ctx.lineTo(absps[0].x, absps[0].y);
        // this.ctx.closePath();
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
    constructor(game, color, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.players = game.players;
        this.game = game;
        this.color = color;
        this.piececanvases = [];
        this.pos_before = pos.copy();
    }
    update(user, game){
        super.update(user);
        for(let pc of this.piececanvases){
            pc.pos = pc.pos.add(this.pos.sub(this.pos_before));
        }
        this.pos_before = this.pos.copy();
    }

    draw(){
        this.ctx.fillStyle = ColorInfo.forKomadai[S_Color[this.color]];
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        this.ctx.fillStyle = "black"
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.pos.x, this.pos.y, this.w, this.h);
    }
}

class MyKomadaiCanvas extends KomadaiCanvas{
    constructor(game, my_color, ctx, pos, w, h){
        super(game, my_color, ctx, pos, w, h);
    }
    draw(){
        this.ctx.fillStyle = ColorInfo.forKomadai[S_Color[this.color]];
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.pos.x, this.pos.y, this.w, this.h);
    }
}

class PieceCanvas extends BaseCanvas{
    constructor(piece, n_rot30, ctx, pos, w, h, size){
        super(ctx, pos, w, h);
        this.piece = piece;
        this.n_rot30 = n_rot30;
        this.draggable = true;
        this.size = size;
    }
    update(user){
        super.update(user);
    }
    drag_update(user){
        if(this.dragging && user.wheel != 0){
            this.n_rot30 += user.wheel;
            let ip = this.piece.get_n_pivot(this.where_ijk(this.tri_size));
            this.piece.rotate(user.wheel, ip);
            // console.log("wheel" + " "+ this.n_rot30);
        }
    }
    drop(user){

    }

    draw(){
        let s_color = ColorInfo.forBoard[S_Color[this.piece.color]];
        this.ctx.fillStyle = s_color;
        // this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        let size = this.size;
        let larger = true;
        this.vi = new Point(0, 1).multiply(size);
        this.vj = new Point(-sqrt(3)/2, -1/2).multiply(size);
        this.vk = new Point(+sqrt(3)/2, -1/2).multiply(size);

        for(let triangle of this.piece.content){
            let ip = triangle;
            let ps = ip.get_points_around_triangle();
            let relps = [];
            for(let point of ps){
                let relp = this.vi.multiply(point.i).add(this.vj.multiply(point.j).add(this.vk.multiply(point.k)));
                relps.push(relp);
            }

            let alpha = 0.8;
            if(larger) alpha = 0.9;
            relps = Point.change_ratio_triangle(alpha, relps);
            let absps = [];
            for(let relp of relps){
                absps.push(relp.add(this.abs_center));
            }
            this.ctx.beginPath();
            this.ctx.moveTo(absps[0].x, absps[0].y);
            this.ctx.lineTo(absps[1].x, absps[1].y);
            this.ctx.lineTo(absps[2].x, absps[2].y);
            this.ctx.lineTo(absps[0].x, absps[0].y);
            // this.ctx.closePath();
            this.ctx.fill();
        }
    }
    contains_mouse(){
        let flag = false;
        let ip = this.where_ijk(this.tri_size);
        for(let ip_tri of this.piece.content){
            if(ip_tri.equals(ip)){
                return true;
            }
        }
        return false;
    }
}

class TestCanvas extends BaseCanvas{
    constructor(ctx, pos, w, h){
        super(ctx, pos, w, h);
        // this.dragging = false;
    }
    update(user){
        super.update(user);
        $("#drag").text(`${this.user.mousedown} ${this.contains_mouse()} ${this.dragging}`)
    }
    draw(){
        console.log(this.dragging);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
    }
}
