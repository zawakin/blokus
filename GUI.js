class BaseCanvas{
    constructor(ctx, pos, w, h){
        this.ctx = ctx;
        this.pos = pos;
        this.w = w;
        this.h = h;
    }
    draw(ctx){

    }
}
class GameCanvas extends BaseCanvas{
    constructor(game, ctx, pos, w, h){
        super(ctx);
        this.game = game;
    }
}

class BoardCanvas extends BaseCanvas{
    constructor(board, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.board = board;
    }
}

class PiecesCanvas extends BaseCanvas{
    constructor(player, ctx, pos, w, h){
        super(ctx, pos, w, h);
        this.player = player;
    }
}
