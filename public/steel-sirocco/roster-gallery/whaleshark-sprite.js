// <whaleshark-sprite> — animated top-down pixel-art whale-shark mech (faction 10 · navy hull, bone spots).
// Largest frame in the roster and the only pure swimmer: no legs. A travelling sine wave undulates the
// whole hull, the caudal crescent beats side to side, and the pectoral fins flex on the stroke.
// Broad squared filter-feeder head with a full-width mouth, five gill slits per side, three dorsal
// ridges and the checkerboard spot grid. No face features (top-down view).
// Layers: head / fins / tail / frame
// Attributes: mode="idle" | "walk" (= fast swim) | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=150,H=310;
const INK='#001220',HULL='#003049',HULL_L='#0A4A6E',HULL_S='#001E30',
SPOT='#EDE6DD',SPOT_S='#B9B2A8',TAN='#D4B996',TAN_S='#A8926F',
GRY='#4A6B80',GRY_S='#2E4A5C',
BG='#454034',DOT='#3b382e',SHDW='#000A14';
const cx=75;
// smooth continuous hull half-width: blunt wide head → widest at y50 → long taper to the peduncle
const hwAt=(y)=>{
  if(y<26||y>=266)return 0;
  if(y<50)return Math.max(6,34*Math.sqrt(Math.max(0,1-Math.pow((50-y)/30,2))));   // rounded snout corners
  const q=(y-50)/216;
  return Math.max(4,34*(1-Math.pow(q,1.7)*.90));
};
class WhalesharkSprite extends HTMLElement{
  connectedCallback(){
    if(this._cv) return;
    const root=this.attachShadow({mode:'open'});
    const st=document.createElement('style');
    st.textContent=':host{display:inline-block;height:100%}canvas{image-rendering:pixelated;height:100%;display:block}';
    root.appendChild(st);
    this._cv=document.createElement('canvas');this._cv.width=W;this._cv.height=H;
    root.appendChild(this._cv);
    this._ctx=this._cv.getContext('2d');
    this._scroll=0;this._mode=0;this._last=0;
    const loop=()=>{if(this.isConnected){this._draw();this._raf=requestAnimationFrame(loop);}};
    loop();
  }
  disconnectedCallback(){cancelAnimationFrame(this._raf);}
  _draw(){
    const ctx=this._ctx, ground=this.hasAttribute('ground'), stat=this.hasAttribute('static');
    const attr=this.getAttribute('mode')||'idle';
    const hide=(this.getAttribute('hide')||'').split(',');
    const HP=(k)=>hide.indexOf(k)>=0;
    const t=performance.now()/1000;
    let mode=attr==='walk'?1:0;
    if(attr==='cycle'){if(t-this._last>4){this._mode=1-this._mode;this._last=t;}mode=this._mode;}
    const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const O=(x,y,w,h,c)=>{R(x-1,y-1,w+2,h+2,INK);R(x,y,w,h,c);};
    const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
    const ph=t*(mode?2.6:1.25);
    if(mode)this._scroll+=.5;
    // travelling undulation — every row shifts by a wave that runs from head to tail
    const amp=stat?0:(mode?4:2);
    const und=(y)=>Math.round(Math.sin(y*.028-ph)*amp*Math.min(1,(y-20)/90));
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<120;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame'))for(let y=26;y<266;y+=2){const hw=Math.round(hwAt(y));if(hw)R(cx-hw+und(y)+4,y+5,hw*2,2,SHDW);}
    // scanline polygon fill in half-space offsets, mirrored exactly per side
    const poly=(s,pts,cFill,xoFn)=>{
      let ys=1e9,ye=-1e9;for(const[,py]of pts){ys=Math.min(ys,py);ye=Math.max(ye,py);}
      for(let pass=0;pass<2;pass++)
      for(let y=Math.round(ys);y<=Math.round(ye);y++){
        let lo=1e9,hi=-1e9;
        for(let k=0;k<pts.length;k++){
          const[ax,ay]=pts[k],[bx2,by2]=pts[(k+1)%pts.length];
          if(Math.abs(by2-ay)<.001)continue;
          if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)){
            const x=ax+(bx2-ax)*(y-ay)/(by2-ay);lo=Math.min(lo,x);hi=Math.max(hi,x);}}
        if(hi<lo)continue;
        const m=pass?0:1, xo=xoFn?xoFn(y):0,
          a=sym(lo)-m, b=sym(hi)+m, w=Math.max(1,b-a+1);
        R((s>0?cx+a+xo:cx-b+xo),y,w,1,pass?cFill:INK);}
    };
    // ---- fins (below the hull so their roots tuck under) ----
    if(!HP('fins')){
      const flex=stat?0:Math.round(Math.sin(ph)*(mode?5:2));
      for(const s of[-1,1]){
        poly(s,[[24,68],[58+flex,112],[50+flex,124],[26,96]],HULL);           // pectoral — long swept blade
        poly(s,[[19,150],[40+flex,176],[33+flex,186],[20,168]],HULL_S);       // pelvic
        for(let i=0;i<=44;i++){const u=i/44,                                  // pectoral leading spar
          px2=sym(24+(58+flex-24)*u), py2=Math.round(68+(112-68)*u);
          R((s>0?cx+px2:cx-px2),py2,1,1,u<.6?HULL_L:GRY);}
      }
    }
    // ---- tail: caudal crescent, beats side to side ----
    if(!HP('tail')){
      const sw=stat?0:Math.sin(ph+.6)*(mode?8:3.5);
      const ty0=264, root=und(264), bend=(y)=>root+Math.round(sw*Math.max(0,y-ty0)/44);
      for(let y=ty0;y<ty0+16;y++){const w=Math.max(3,Math.round(4-(y-ty0)*.08)),xo=bend(y);
        R(cx-w-1+xo,y,w*2+2,1,INK);R(cx-w+xo,y,w*2,1,HULL);}                  // peduncle, flush with the hull end
      for(const s of[-1,1])
        poly(s,[[2,ty0+1],[15,ty0+22],[23,ty0+44],[12,ty0+38],[3,ty0+19]],HULL,bend);
    }
    // ---- frame: hull, spot grid, ridges ----
    if(!HP('frame')){
      for(let y=26;y<266;y++){const xo=und(y),hw=Math.round(hwAt(y));if(!hw)continue;
        R(cx-hw-1+xo,y,hw*2+2,1,INK);}
      for(let y=26;y<266;y++){const xo=und(y),hw=Math.round(hwAt(y));if(!hw)continue;
        R(cx-hw+xo,y,hw*2,1,HULL);
        R(cx+hw-4+xo,y,4,1,HULL_S);R(cx-hw+xo,y,2,1,HULL_L);}
      // three dorsal ridges running the length of the hull
      for(let y=40;y<250;y++){const xo=und(y),hw=Math.round(hwAt(y));if(!hw)continue;
        R(cx-1+xo,y,3,1,HULL_L);
        const rk=Math.round(hw*.55);
        if(rk>4){R(cx+rk+xo,y,2,1,HULL_L);R(cx-rk-1+xo,y,2,1,HULL_L);}}
      // checkerboard spot grid — offset rows, clipped to the hull
      for(let y=34;y<250;y+=9){const xo=und(y),hw=Math.round(hwAt(y)),off=((y/9)|0)%2?4:0;
        for(let a=-hw+6+off;a<hw-4;a+=9){
          if(Math.abs(a)>hw-5)continue;
          const px2=cx+sym(a)+xo;
          R(px2-1,y,3,2,SPOT);R(px2-1,y+2,3,1,SPOT_S);}}
      // pale cross bars between spot rows
      for(let y=39;y<248;y+=18){const xo=und(y),hw=Math.round(hwAt(y));if(hw<10)continue;
        R(cx-hw+5+xo,y,hw*2-10,1,SPOT_S);}
      // dorsal fin bases (top-down: raised keels on the spine)
      {const xo=und(128);
       for(let i=0;i<34;i++){const w=Math.round(7-Math.abs(i-14)*.32);
         R(cx-w+und(122+i)-0,122+i,w*2,1,i<3||i>30?HULL_S:HULL_L);}
       R(cx-1+xo,122,3,34,SPOT);}
      {for(let i=0;i<16;i++){const w=Math.round(4-Math.abs(i-7)*.3);
         R(cx-w+und(206+i),206+i,w*2,1,HULL_L);}}
      // gill slits — five per side behind the head
      for(const s of[-1,1])for(let g=0;g<5;g++){const gy=64+g*7,hw=Math.round(hwAt(gy)),xo=und(gy),
        a=hw-8-g;
        for(let k=0;k<7;k++)R((s>0?cx+sym(a-k*.4):cx-sym(a-k*.4))+xo,gy+k,1,1,k<6?INK:GRY_S);}
    }
    // ---- head: blunt filter-feeder snout with the full-width mouth ----
    if(!HP('head')){
      const xo=und(28);
      R(cx-18+xo,24,36,3,INK);                                     // mouth outline
      R(cx-17+xo,25,34,2,GRY_S);                                   // dark gape
      R(cx-17+xo,24,34,1,TAN_S);                                   // upper lip
      R(cx-14+xo,27,28,1,TAN);                                     // lower lip highlight
      for(let i=0;i<7;i++){const px2=cx+sym(-12+i*4)+xo;R(px2,25,2,2,GRY);}  // filter-pad ribs
      for(const s of[-1,1]){                                       // nostril notches at the snout corners
        R((s>0?cx+sym(15):cx-sym(15))+xo,29,3,2,HULL_S);
        R((s>0?cx+sym(15):cx-sym(15))+xo,31,3,1,HULL_L);}
      for(let a=-10;a<=10;a+=7){const px2=cx+sym(a)+xo;            // crown plating seam
        R(px2-1,32,3,2,SPOT);R(px2-1,34,3,1,SPOT_S);}
    }
  }
}
if(!customElements.get('whaleshark-sprite'))customElements.define('whaleshark-sprite',WhalesharkSprite);
})();
