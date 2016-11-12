var PI = Math.PI;
var sqrt = Math.sqrt;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var abs = Math.abs;
var atan2 = Math.atan2;
var asin = Math.asin;
var floor = Math.floor;
var ceil = Math.ceil;

var mod = function(a,b){
  return a - b * Math.floor(a/b);
}

var imod = function(a, b){
    return floor(mod(a, b));
}
var irepel = function(i){
    let fi = ceil(i);
    if(fi <= 0){
        return fi - 1;
    }
    return fi;
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
    let dx = p.x - this.x;
    let dy = p.y - this.y;
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
  dot(p){
      return this.x * p.x + this.y * p.y;
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
      let g = (ps[0].add(ps[1].add(ps[2]))).div(3);
      let _ps = [];
      for(let p of ps){
          _ps.push(g.add(p.sub(g).multiply(ratio)));
      }
      return _ps;
  }

}
