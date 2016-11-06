var PI = Math.PI;
var sqrt = Math.sqrt;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var abs = Math.abs;
var atan2 = Math.atan2;
var asin = Math.asin;
var floor = Math.floor;

var mod = function(a,b){
  return a - b * Math.floor(a/b);
}

var imod = function(a, b){
    return floor(mod(a, b));
}

var radToDeg = function(rad){
  return rad / PI * 180;
}
var degToRad = function(deg){
  return deg / 180 * PI;
}

class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
  dist(p){
    var dx = p.x - this.x;
    var dy = p.y - this.y;
    return sqrt(dx*dx + dy*dy);
  }
  set(x, y){
      this.x = x;
      this.y = y;
  }
  add(p){
    return new Point(this.x+p.x,this.y+p.y);
  }
  multiply(s){
    return new Point(this.x*s,this.y*s);
  }
  sub(p){
    return this.add(p.multiply(-1));
  }
  div(s){
    return this.multiply(1.0/s);
  }
  ang(){
    return mod(atan2(this.y,this.x),2*PI);
  }
  norm(){
    return sqrt(this.x*this.x+this.y*this.y);
  }
  outer(p){
      return this.x * p.y - this.y * p.x;
  }
  normedVector(){
    // return
    return this.div(this.norm());
  }
  static One(){
      return new Point(1,1);
  }
  static Zero(){
      return new Point(0,0);
  }
  static createFromPolar(r,theta){
    return new Point(r*cos(theta),r*sin(theta));
  }

  static change_ratio_triangle(ratio, ps){
      var g = (ps[0].add(ps[1].add(ps[2]))).div(3);
      var _ps = [];
      for(let p of ps){
          _ps.push(g.add(p.sub(g).multiply(ratio)));
      }
      return _ps;
  }

}

class Triangle{
    constructor(p1, p2, p3){
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
}

class Converter{
    static pos2key(i1, i2){
        return (i1+256) * 512+ (i2+256);
    }
    static key2pos(key){
        return [floor(key/512) - 256, key % 512 - 256];
    }
    static add_key_relpos(key, relpos){
        var p = Converter.key2pos(key);
        return Converter.pos2key(p[0]+relpos[0],p[1]+relpos[1]);
    }
}
var p2k = Converter.pos2key;
var k2p = Converter.key2pos;


var Color = {NONE : 0, BLUE:1, RED:2, GREEN:3, YELLOW:4};
var Direction = {UP : 0, DOWN : 1};

class Grid{
    constructor(ps, direction, color){
        this.ps = ps;
        this.color = color;
    }



    draw(ctx){
        fill_triangle(ctx, this.ps, RGBs[color].STRONG.get_color());
    }

}

class Piece{
    constructor(design){
        this.design = design;
        this.direction = Direction.UP;
    }

    update_pos(){

    }

    static InitialPieces(n_player){
        var pieces = [];
        pieces.push(new Piece([[0,0],[0,1],[0,2]]));
    }
}

class RGB{
    constructor(R, G, B){
        this.R = R;
        this.G = G;
        this.B = B;
    }
    get_color(alpha){
        return "rgba("+this.R+","+this.G+","+this.B+","+alpha+")";
    }

}
class RGBA extends RGB{
    constructor(R, G, B, alpha){
        super(R, G, B);
        this.alpha = alpha;
    }
    get_color(){
        return "rgba("+this.R+","+this.G+","+this.B+","+this.alpha+")";
    }
}

var RGBs = {
    // 0 : {strong : new }
    // 2 : {STRONG : new RGBA(255,0,0,0.9), WEAK : new RGBA(255,0,0,0.7)},  //RED
    2 : new RGB(255,0,0),
    1 : new RGB(0,0,255), //BLUE
    3 : new RGB(0,255,0), //GREEN
    4 : new RGB(255,255,0) //YELLOW
}

class Block{
    constructor(bkey, drawsize, board_pos){
        this.color = Color.NONE;
        var bb = Converter.key2pos(bkey);
        this.i = bb[0];
        this.j = bb[1];
        this.direction = (this.i + this.j) % 2;
        this.pk = [];
        this.pindex = [];
        this.h = sqrt(3) / 2 * drawsize;
        this.w = drawsize;
        this.w_half = drawsize / 2;

        if(this.direction == Direction.UP){
            //時計回り
            this.pindex.push([this.i, this.j]);
            this.pindex.push([this.i+1, this.j-1]);
            this.pindex.push([this.i+1, this.j+1]);
        }else{
            //時計回り
            //Direction.DONW
            this.pindex.push([this.i, this.j-1]);
            this.pindex.push([this.i, this.j+1]);
            this.pindex.push([this.i+1, this.j]);
        }
        for(let pindex of this.pindex){
            for(let pi of pindex){
                this.pk.push(Converter.pos2key(pi[0],pi[1]));
            }
        }
        this.ps = this.abs_pos(board_pos);
    }

    put(color){
        this.color = color;
    }
    abs_pos(board_pos){
        var ps = [];
            for(let pindex of this.pindex){
                var relpos = new Point(pindex[1]*this.w_half, pindex[0]*this.h);
                ps.push(relpos.add(board_pos));
            }
        return ps;
    }

    check_inner(p, board_pos){
        var ps = this.ps;
        var AB = ps[1].sub(ps[0]);
        var BC = ps[2].sub(ps[1]);
        var CA = ps[0].sub(ps[2]);
        var BP = p.sub(ps[1]);
        var CP = p.sub(ps[2]);
        var AP = p.sub(ps[0]);
        var o1 = AB.outer(BP);
        var o2 = BC.outer(CP);
        var o3 = CA.outer(AP);
        if(o1*o2 > 0 && o2 * o3 > 0){
            return true;
        }
        return false;
    }

    draw(ctx, board_pos){
        var ps = this.abs_pos(board_pos);
        console.log(this.color, Color.NONE);
        if(this.color == Color.NONE){
            ctx.fillStyle = "#eeeeee";
            ctx.beginPath();
            ctx.moveTo(ps[0].x, ps[0].y);
            ctx.lineTo(ps[1].x, ps[1].y);
            ctx.lineTo(ps[2].x, ps[2].y);
            ctx.closePath();
            ctx.fill();
        }else{
            console.log("違う色");
            this.fill(ctx, this.color);
        }
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(ps[0].x, ps[0].y);
        ctx.lineTo(ps[1].x, ps[1].y);
        ctx.lineTo(ps[2].x, ps[2].y);
        ctx.closePath();
        ctx.stroke();
    }

    fill(ctx, fill_color, board_pos){
        var ps_before = this.abs_pos(board_pos);
        var ps = Point.change_ratio_triangle(0.7, ps_before);
        fill_triangle(ctx, ps_before, RGBs[fill_color].get_color(0.4));

        fill_triangle(ctx, ps, RGBs[fill_color].get_color(0.9));

    }

    pkey2abs_pos(){

    }

}

function fill_triangle(ctx, ps, fill_color){
    ctx.fillStyle = fill_color;
    ctx.beginPath();
    ctx.moveTo(ps[0].x, ps[0].y);
    ctx.lineTo(ps[1].x, ps[1].y);
    ctx.lineTo(ps[2].x, ps[2].y);
    ctx.closePath();
    ctx.fill();
}

class Board{
    constructor(size, p_lefttop, drawsize, ctx){
        this.size = size;
        this.lefttop = p_lefttop;
        this.drawsize = drawsize;
        this.blocks = {};
        this.bkeys = [];
        this.ctx = ctx;
        this.h = sqrt(3) / 2 * drawsize;
        this.w = drawsize;
        this.w_half = drawsize / 2;
        this.mouse_on = false;
        
        for(var i=0; i<=2*size; i++){
            for(var j=-i; j<=2*size+i; j++){
                var bkey = Converter.pos2key(i,j);
                this.blocks[bkey] = new Block(bkey, this.drawsize, this.lefttop);
                this.bkeys.push(bkey);
                // console.log(Converter.key2pos(bkey));
            }
        }
    }

    which_block(p){
        var p_rel = p.sub(this.lefttop);
        var _i = floor(p_rel.y / this.h);
        var _j = floor(p_rel.x / this.w_half);
        var _rr = p_rel.sub(new Point(_j*this.w_half, _i*this.h));
        var bkey = Converter.pos2key(_i, _j);

        var bkey;
        for(let _bkey of this.bkeys){
            var flag = this.blocks[_bkey].check_inner(p, this.lefttop);
            if(flag){
                console.log(Converter.key2pos(_bkey));
                bkey = _bkey;
                this.blocks[bkey].fill(this.ctx, Color.YELLOW, this.lefttop);
                break;
            }
        }
        if(bkey){
            return bkey;
        }else{
            return -1;
        }
    }

    draw(mouse){
        for(let bkey of this.bkeys){
            // console.log(bkey);
            this.blocks[bkey].draw(this.ctx, this.lefttop);
        }
        this.which_block(mouse);
    }

    check_okeru(bkey, piece){
        var block = this.blocks[bkey];
        var bpos = k2p(bkey);
        if(block.direction != piece.direction){
            console.log("置けませぬ");
            return false;
        }
        for(let p of piece.design){
            var bkey_next = Converter.add_key_relpos(bkey, p);
            if(this.blocks[bkey_next].color != Color.NONE){
                console.log("すでに置かれています");
                return false;
            }
        }
        return true;


    }
    put_piece(bkey, piece, color){
        for(let p of piece.design){
            var bkey_next = Converter.add_key_relpos(bkey, p);
            this.blocks[bkey_next].put(color);
        }
    }

}

// class Kyokumen{
//     constructor()
// }
class Kyokumen{
    constructor(){
        this.board = {};
        for(var i=0; i<=2*size; i++){
            for(var j=-i; j<=2*size+i; j++){
                var bkey = Converter.pos2key(i,j);
                this.blocks[bkey] = new Block(bkey, this.drawsize, this.lefttop);
                this.bkeys.push(bkey);
            }
        }
    }
}

class Game{
    constructor(size, n_player, lefttop, drawsize, ctx){
        this.size = size;
        this.n_player = n_player;
        this.turn = 0;
        this.board = new Board(size, lefttop, drawsize, ctx);
        this.pieces = [];
        for(var i=0;i<this.n_player;i++){
            this.pieces.push(Piece.InitialPieces());
        }
    }

    update(mouse){
        this.mouse = mouse;
    }

    draw(ctx){
        this.board.draw()
    }
    put(bkey, piece){
        if(this.board.check_okeru(bkey, piece)){
            this.board.put_piece(bkey, piece, this.turn+1);
            this.turn = (this.turn + 1) % this.n_player;
        }else{
            console.log("置けませんでした");
        }
    }
}
