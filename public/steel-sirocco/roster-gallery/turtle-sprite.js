// <turtle-sprite> — animated top-down pixel-art sea-turtle mech (faction 6, faction-6 blues with
// green/brown/beige accents: cyan carapace, beige scute seams, brown scute streaks + rim divisions).
// Built to the species-chart reference: rounded teardrop carapace with a subtly scalloped marginal
// ring, 5 hexagonal vertebral scutes + 4 costal scutes per side, BROAD swept front flippers,
// small rear paddles, broad rounded scale-plated head on a brown scaled collar, tiny tail.
// Layers: head/legsA/legsB/tail/frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=160,H=142;
const INK='#03045E',
HULL='#00B4D8',HULL_L='#90E0EF',HULL_S='#0077B6',
BRN='#6B4A22',BRN_L='#8F6A34',BRN_S='#3E2A12',
BEI='#E8DCC0',BEI_S='#B8A87E',GRN='#4C9A2A',
GRY='#5A7A96',GRY_S='#3A5470',
ACC='#90E0EF',ACC_S='#5AB8CC',
BG='#454034',DOT='#3b382e',SHDW='#02043A';
const cx=80;
// carapace profile [y, halfwidth] — rounded front, widest at the shoulders, rounded rear
const PROF=[[26,20],[32,29],[40,37],[48,43],[58,46],[70,46],[80,43],[90,38],[100,31],[108,22],[116,8]];
const base=(y)=>{if(y<=PROF[0][0])return PROF[0][1];
  for(let i=0;i<PROF.length-1;i++){const[y0,h0]=PROF[i],[y1,h1]=PROF[i+1];
    if(y>=y0&&y<=y1)return h0+(h1-h0)*(y-y0)/(y1-y0);}return 0;};
const saw=(y)=>{const p=(((y-30)%13)+13)%13/13, amp=y<62?1.5:2.5;return amp*(1-Math.abs(p*2-1));};
const shw=(y)=>Math.round(base(y)+saw(y));
const ihw=(y)=>Math.round(base(y)*0.85);
// vertebral scutes [y0, h, halfwidth]
const VERT=[[33,16,10],[49,17,12],[66,17,12],[83,16,11],[99,15,8]];
const vhwAt=(y)=>{for(const[y0,h,hwm]of VERT){if(y>=y0&&y<y0+h){const f=1-Math.abs((y-y0+0.5)/h*2-1)*0.62;return Math.round(hwm*f);}}return 0;};
const COSTAL=[[34,17],[52,18],[71,18],[90,17]];
// head profile [y0,y1,halfw] — rounded crown tapering to a snub snout
const HEAD=[[2,6,6],[6,12,10],[12,20,13],[20,27,12],[27,32,9]];
// flipper outlines in half-space: [xoff, y, reach]
// front flipper — one continuous hook: near-vertical arm reaching FORWARD, then the blade
// arcs OUT and DOWN away from the body. Convex edge walked root→tip, concave edge tip→root.
const FRONT=[[11,51,0],[13,34,.15],[22,14,.35],[42,9,.55],[59,21,.75],[70,37,.9],[75,48,1],
  [73,53,1],[69,52,1],[62,43,.9],[49,31,.7],[34,23,.4],[30,30,.25],[31,38,.15],[29,53,0]];
const REAR=[[20,100,0],[30,106,.5],[38,114,.9],[38,122,1],[30,125,1],[22,118,.5],[16,110,.2],[15,102,0]];
class TurtleSprite extends HTMLElement{
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
    // outlined polygon fill (even-odd scanline; 1px INK border)
    const polyO=(pts,c)=>{
      let ys=1e9,ye=-1e9;for(const[,py]of pts){ys=Math.min(ys,py);ye=Math.max(ye,py);}
      const rows=[];
      for(let y=Math.round(ys);y<=Math.round(ye);y++){const xs=[];
        for(let i=0;i<pts.length;i++){const[ax,ay]=pts[i],[bx2,by2]=pts[(i+1)%pts.length];
          if((ay<=y&&by2>y)||(by2<=y&&ay>y))xs.push(ax+(bx2-ax)*(y-ay)/(by2-ay));}
        xs.sort((a,b)=>a-b);rows.push([y,xs]);}
      for(const[y,xs]of rows)for(let i=0;i+1<xs.length;i+=2){const x0=Math.round(xs[i]),x1=Math.round(xs[i+1]);if(x1>x0)R(x0,y,x1-x0,1,INK);}
      for(let k=1;k<rows.length-1;k++){const[y,xs]=rows[k];
        for(let i=0;i+1<xs.length;i+=2){const x0=Math.round(xs[i])+1,x1=Math.round(xs[i+1])-1;if(x1>x0)R(x0,y,x1-x0,1,c);}}
      return rows;
    };
    let bob,swayX,tailS,st4;
    if(mode===0){bob=Math.round(Math.sin(t*1.5)*1);swayX=0;tailS=Math.sin(t*1.2)*2;
      const a=Math.sin(t*1.3)*2;st4=[a,-a,a*0.6,-a*0.6];}
    else{const ph=t*3.2;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*1.5;
      this._scroll+=.35;
      const a=Math.sin(ph)*7,b=Math.sin(ph+Math.PI)*7;st4=[a,b,b*0.5,a*0.5];}
    if(stat){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    const ox=swayX,oy=bob;
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow — follows the carapace profile
    if(!HP('frame')){for(let y=26;y<=116;y++){const hw=shw(y);if(hw<=0)continue;R(cx-hw+ox+2,y+oy+3,hw*2,1,SHDW);}}
    // ---- flippers: broad swept paddles, yellow-edged with brown scale tiles ----
    const flipper=(spec,s,stroke,step)=>{
      const pts=spec.map(([xo,py,f])=>[cx+ox+s*(xo+stroke*0.45*f),py+oy+stroke*f]);
      const rows=polyO(pts,HULL);
      for(let k=2;k<rows.length-2;k+=step){const[y,xs]=rows[k];
        for(let i=0;i+1<xs.length;i+=2){const x0=Math.round(xs[i])+2,x1=Math.round(xs[i+1])-2;if(x1-x0<4)continue;
          const mid=Math.round((x0+x1)/2);
          R(x0,y,3,1,GRN);R(mid-1,y,3,1,GRN);R(x1-3,y,3,1,GRN);}}      // brown scale tiles (per span)
      for(let k=1;k<rows.length-1;k++){const[y,xs]=rows[k];
        for(let i=0;i+1<xs.length;i+=2){const xa=Math.round(xs[i]),xb=Math.round(xs[i+1]);if(xb-xa<3)continue;
          R(s>0?xa+1:xb-2,y,2,1,BEI);                                   // yellow leading edge
          R(s>0?xb-2:xa+1,y,1,1,HULL_S);}}                              // shaded trailing edge
    };
    if(!HP('legsB')){flipper(REAR,-1,st4[2],5);flipper(REAR,1,st4[3],5);}
    if(!HP('legsA')){flipper(FRONT,-1,st4[0],6);flipper(FRONT,1,st4[1],6);}
    // ---- tail: downward-pointing triangle wedge ----
    if(!HP('tail')){const px=cx+ox, off=Math.round(tailS*0.5);
      for(let i=0;i<20;i++){const y=108+i, hw=Math.max(1,Math.round(6-i*0.28));
        R(px-hw-1+off,y+oy,hw*2+2,1,INK);}
      for(let i=0;i<19;i++){const y=108+i, hw=Math.max(1,Math.round(6-i*0.28));
        R(px-hw+off,y+oy,hw*2,1,i>11?GRY_S:HULL_S);}}
    // ---- head: broad rounded skull, yellow-seamed scale plates, brown collar ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*7)*1):Math.round(Math.sin(t*1.1)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      O(cx-14+hx,26+hy,28,8,HULL_S);R(cx-14+hx,26+hy,28,2,ACC_S);          // scaled neck collar
      for(let i=0;i<6;i++)R(cx-12+i*4+hx,28+hy,3,4,BRN);
      for(const[y0,y1,hw]of HEAD)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HEAD)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HEAD){R(cx+hw-3+hx,y0+hy,3,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // scale plates — yellow-seamed polygon grid
      for(const[py2,ph,cols]of[[4,7,[[-9,6],[-3,6],[3,6]]],[11,8,[[-12,8],[-4,8],[4,8]]],[19,8,[[-11,7],[-4,8],[4,7]]]])
        for(const[sx2,sw]of cols){
          R(cx+sx2+hx,py2+hy,sw,ph,HULL);
          R(cx+sx2+hx,py2+hy,sw,1,BEI);R(cx+sx2+hx,py2+hy,1,ph,BEI);
          R(cx+sx2+hx,py2+1+hy,sw-1,1,HULL_L);R(cx+sx2+sw-1+hx,py2+hy,1,ph,HULL_S);}
      R(cx-2+hx,2+hy,4,3,BRN);R(cx-2+hx,3+hy,1,1,BRN_S);R(cx+1+hx,3+hy,1,1,BRN_S); // nostril pad
    }
    // ---- frame: the carapace ----
    if(!HP('frame')){
      for(let y=26;y<=116;y++){const hw=shw(y);if(hw<=0)continue;R(cx-hw-1+ox,y+oy,hw*2+2,1,INK);}
      for(let y=27;y<116;y++){const hw=shw(y);if(hw<=1)continue;
        R(cx-hw+ox,y+oy,hw*2,1,HULL);R(cx+hw-3+ox,y+oy,3,1,HULL_S);R(cx-hw+ox,y+oy,1,1,HULL_L);}
      // brown marginal scute ring, scalloped
      for(let y=27;y<116;y++){const hw=shw(y),ih=ihw(y);if(hw<=1)continue;
        if(ih<=0)R(cx-hw+ox,y+oy,hw*2,1,HULL_S);
        else{R(cx-hw+ox,y+oy,hw-ih,1,HULL_S);R(cx+ih+ox,y+oy,hw-ih,1,HULL_S);}
        R(cx-hw+ox,y+oy,1,1,BEI_S);R(cx+hw-1+ox,y+oy,1,1,INK);}
      for(let y=30;y<116;y+=13){const hw=shw(y),ih=ihw(y);                // rim scute divisions
        if(hw<=ih)continue;
        R(cx-hw+ox,y+oy,hw-ih,1,BRN);R(cx+ih+ox,y+oy,hw-ih,1,BRN);}
      // costal scutes — column out to the marginal ring, yellow seams + brown streak
      for(const s of[-1,1])for(const[y0,h]of COSTAL){
        for(let i=0;i<h;i++){const y=y0+i,vi=vhwAt(y)+2,mo=ihw(y)-1;if(mo<=vi)continue;
          const x=s>0?cx+vi:cx-mo;R(x-1+ox,y+oy,mo-vi+2,1,BEI);}
        for(let i=1;i<h-1;i++){const y=y0+i,vi=vhwAt(y)+3,mo=ihw(y)-2;if(mo<=vi)continue;
          const x=s>0?cx+vi:cx-mo;R(x+ox,y+oy,mo-vi,1,HULL);
          if(i===1)R(x+ox,y+oy,mo-vi,1,HULL_L);
          if(i===h-2)R(x+ox,y+oy,mo-vi,1,HULL_S);
          if(i===Math.round(h/2))R(x+ox+2,y+oy,mo-vi-4,1,GRN);}}
      // vertebral scutes — 5 stacked hexagons, yellow seams + brown centre streak
      for(const[y0,h,hwm]of VERT){
        for(let i=0;i<h;i++){const f=1-Math.abs((i+0.5)/h*2-1)*0.62,hw=Math.max(2,Math.round(hwm*f));
          R(cx-hw-1+ox,y0+i+oy,hw*2+2,1,BEI);}
        for(let i=1;i<h-1;i++){const f=1-Math.abs((i+0.5)/h*2-1)*0.62,hw=Math.max(2,Math.round(hwm*f))-1;
          if(hw<=0)continue;R(cx-hw+ox,y0+i+oy,hw*2,1,HULL);
          if(i===1)R(cx-hw+ox,y0+i+oy,hw*2,1,HULL_L);
          if(i===h-2)R(cx-hw+ox,y0+i+oy,hw*2,1,HULL_S);}
        R(cx-3+ox,y0+3+oy,6,h-6,BRN);R(cx-1+ox,y0+3+oy,2,h-6,BRN_S);}
    }
  }
}
if(!customElements.get('turtle-sprite'))customElements.define('turtle-sprite',TurtleSprite);
})();
