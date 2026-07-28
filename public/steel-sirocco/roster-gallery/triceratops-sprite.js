// <triceratops-sprite> — animated top-down pixel-art triceratops mech (faction 6 · cyan/navy).
// Silhouette per user's top-down reference: narrow snout carrying ONE big rhino-like nose horn at the
// very tip, TWO small horn bumps halfway down the skull, then an arrowhead SHIELD flaring to sharp
// lateral points with a scalloped rear edge, over a smooth teardrop body tapering to a pointed tail.
// No face features — top-down view shows only the top of the skull.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
// Layers: head / legsA / legsB / tail / frame.
(function(){
const W=180,H=250;
const INK='#03045E',HULL='#00B4D8',HULL_L='#90E0EF',HULL_S='#0077B6',
ARM='#023E8A',ARM_S='#012A5E',ARM_H='#0096C7',
GRY='#5A7A96',GRY_S='#3A5470',ACC='#90E0EF',ACC_S='#5AB8CC',
BEI='#E8DCC0',BEI_S='#B8A87E',
BG='#454034',DOT='#3b382e',SHDW='#02043A';
const cx=90;
// smooth teardrop body — widest just behind the shield, long taper to a point
const bodyHw=(y)=>{
  if(y<58||y>232)return 0;
  if(y<96)return 22+(y-58)*7/38;
  if(y<150)return 29-(y-96)*3/54;
  if(y<200)return 26-(y-150)*18/50;
  return Math.max(0,8-(y-200)*8/32);
};
// arrowhead head shield — snout → skull → flare to lateral points
const headHw=(y)=>{
  if(y<4||y>56)return 0;
  if(y<10)return 4+(y-4)*4/6;
  if(y<28)return 8+(y-10)*8/18;
  if(y<48)return 16+(y-28)*16/20;
  return 32+(y-48)*2/8;
};
const LOBES=[0,10,-10,19,-19,27,-27];   // knobbed rear-edge scallops (outer lobe sits flush with the side edge)
class TriceratopsSprite extends HTMLElement{
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
    const segTap=(s,o0,y0,o1,y1,th0,th1,c,xo)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1);
      for(let i=0;i<=n;i++){const th=Math.max(1,Math.round(th0+(th1-th0)*i/n)),o=Math.floor(th/2),
        xa=sym(o0+dx*i/n),y=Math.round(y0+dyy*i/n);R(cx+(s>0?xa:-xa)-o+(xo||0),y-o,th,th,c);}};
    let bob,swayX,tailS,st4;
    if(mode===0){bob=Math.round(Math.sin(t*1.6)*1);swayX=0;tailS=Math.sin(t*1.1)*3;st4=[0,0,0,0];}
    else{const ph=t*4.6;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*3;
      this._scroll+=.5;
      const a=Math.round(Math.sin(ph)*6),b=Math.round(Math.sin(ph+Math.PI)*6);st4=[a,b,b,a];}
    if(stat){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<90;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (body only — a head shadow only ever showed as a sliver past the shield edge)
    if(!HP('frame')){for(let y=58;y<=190;y+=2){const hw=Math.round(bodyHw(y));if(hw>0)R(cx-hw+swayX+4,y+bob+5,hw*2,2,SHDW);}}
    // ---- legs (bottom layer, tucked close like the reference) ----
    const leg=(s,baseY,stride,front,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+7:-(hw+13));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+5;
      const pw=front?15:14;
      // circular elephant-style foot pad
      const fr=front?9:8, fcx=x0-4+((pw/2)|0), fcy=py+2;
      const padHw=(d,r)=>{const c=Math.sqrt(Math.max(0,r*r-d*d)),
        h=Math.abs(d)<=r*.5?r:Math.max(0,r-(Math.abs(d)-r*.5)*2);
        return Math.round(c*.35+h*.65);};                                 // circle blended toward a hexagon
      for(let d=-fr;d<=fr;d++){const hwf=padHw(d,fr);if(hwf<=0)continue;
        R(fcx-hwf-1,fcy+d,hwf*2+2,1,INK);}                                // hex rim
      for(let d=-fr+1;d<=fr-1;d++){const hwf=padHw(d,fr-1);if(hwf<=0)continue;
        R(fcx-hwf,fcy+d,hwf*2,1,d>fr*.45?GRY_S:GRY);}                     // pad, sole shaded at the back
      for(let i=0;i<3;i++){const nx=fcx-6+i*5;R(nx,fcy-fr+1,4,3,BEI);R(nx,fcy-fr+4,4,1,BEI_S);}  // three toenails on the front arc
      O(x0+1,yTop-2,6,yH+2,ARM_S);                                        // shin
      O(bx+(s>0?hw+3:-(hw+11)),baseY-5+oy,8,13,GRY);                      // ankle
      O(bx+(s>0?hw-4:-(hw+8)),baseY-4+oy,12,10,ARM);                      // thigh
      const j0=bx+(s>0?hw-9:-(hw-9)-12);
      O(j0,baseY-7+oy,12,15,GRY);R(j0+(s>0?10:1),baseY-5+oy,1,10,GRY_S);  // hip disc
    };
    if(!HP('legsA')){leg(-1,100,st4[0],true,28);leg(1,100,st4[1],true,28);}
    if(!HP('legsB')){leg(-1,156,st4[2],false,25);leg(1,156,st4[3],false,25);}
    // ---- tail: the body's own pointed taper ----
    if(!HP('tail')){const px=cx+swayX;
      for(let y=190;y<=232;y++){const hw=Math.round(bodyHw(y));if(hw<=0)continue;
        const o=Math.round(tailS*((y-190)/42));
        R(px-hw-1+o,y+bob,hw*2+2,1,INK);}
      for(let y=190;y<=232;y++){const hw=Math.round(bodyHw(y));if(hw<=0)continue;
        const o=Math.round(tailS*((y-190)/42));
        R(px-hw+o,y+bob,hw*2,1,HULL);
        R(px+hw-3+o,y+bob,Math.min(3,hw*2),1,HULL_S);R(px-hw+o,y+bob,1,1,HULL_L);
        if((y-190)%9===4&&hw>5)R(px-hw+2+o,y+bob,hw*2-4,1,ARM);}          // banding rings
    }
    // ---- frame: smooth teardrop body ----
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(let y=58;y<=190;y++){const hw=Math.round(bodyHw(y));if(hw<=0)continue;R(cx-hw-1+ox,y+oy,hw*2+2,1,INK);}
      for(let y=58;y<=190;y++){const hw=Math.round(bodyHw(y));if(hw<=0)continue;
        R(cx-hw+ox,y+oy,hw*2,1,HULL);
        R(cx+hw-4+ox,y+oy,4,1,HULL_S);R(cx-hw+ox,y+oy,1,1,HULL_L);}
      // segmented vertebral ridge running the body's whole length (per reference)
      for(let i=0;i<13;i++){const py=64+i*10,sw=Math.max(7,Math.round(bodyHw(py)*.42));
        O(cx-sw+ox,py+oy,sw*2,8,ARM);R(cx-sw+ox,py+5+oy,sw*2,3,ARM_S);
        R(cx-sw+2+ox,py+1+oy,sw*2-4,1,ARM_H);}
      for(const y of[70,102,138,172])R(cx-14+ox,y+oy,28,1,HULL_S);        // rib bars
      for(const s of[-1,1]){const vx=cx+ox+(s>0?21:-28);
        R(vx,112+oy,7,5,ACC);R(vx,115+oy,7,2,ACC_S);}                     // flank vents
      for(const s of[-1,1])for(let i=0;i<9;i++){const sy=74+i*13,shw=Math.round(bodyHw(sy));
        R(cx+(s>0?shw-9:-shw+3)+ox,sy+oy,6,1,HULL_S);}                    // flank scale dashes
    }
    // ---- head: nose horn, small brow horns, arrowhead shield ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*9)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      // shield body
      for(let y=4;y<=56;y++){const hw=Math.round(headHw(y));if(hw<=0)continue;R(cx-hw-1+hx,y-1+hy,hw*2+2,1,INK);}
      // scalloped rear edge — rounded lobes hanging off the shield's back
      for(const co of LOBES){for(let dy=0;dy<=7;dy++){const w=Math.round(Math.sqrt(Math.max(0,49-dy*dy))*.95);
        if(w<=0)continue;R(cx+co-w-1+hx,56+dy+hy,w*2+2,1,INK);}}
      for(let y=4;y<=56;y++){const hw=Math.round(headHw(y));if(hw<=0)continue;
        R(cx-hw+hx,y+hy,hw*2,1,HULL);
        R(cx+hw-4+hx,y+hy,Math.min(4,hw*2),1,HULL_S);R(cx-hw+hx,y+hy,Math.min(4,hw*2),1,HULL_S);}  // symmetric edges
      for(const co of LOBES){for(let dy=0;dy<=6;dy++){const w=Math.round(Math.sqrt(Math.max(0,49-dy*dy))*.95);
        if(w<=0)continue;R(cx+co-w+hx,56+dy+hy,w*2,1,HULL);
        R(cx+co+w-2+hx,56+dy+hy,2,1,HULL_S);R(cx+co-w+hx,56+dy+hy,2,1,HULL_S);}}   // symmetric lobe edges
      // ridge seams: centre crest + two ridges sweeping from the horn bases to the lateral points
      R(cx-2+hx,14+hy,5,40,ARM);R(cx-1+hx,14+hy,3,40,ARM_H);
      for(const s of[-1,1]){
        segTap(s,10,26+hy,29,50+hy,4,2,ARM,hx);
        segTap(s,10,26+hy,29,50+hy,2,1,ARM_H,hx);
        R(cx+(s>0?sym(28):-sym(28))-1+hx,50+hy,3,3,ACC_S);}               // lateral point pip
      // knobbed rim studs (epoccipitals) around the shield edge
      for(const co of LOBES)R(cx+co-1+hx,61+hy,3,3,BEI_S);
      for(const s of[-1,1])for(const[ky,ko]of[[34,20],[41,26],[48,30]])
        R(cx+(s>0?sym(ko):-sym(ko))-1+hx,ky+hy,3,3,BEI_S);
      // big rhino-like nose horn on the snout tip (on top, so its full cone reads)
      for(let i=0;i<=20;i++){const y=20-i,w=Math.max(1,Math.round(9-i*8/20)|1);
        R(cx-((w+2)>>1)+hx,y+hy,w+2,1,INK);}
      for(let i=0;i<=19;i++){const y=20-i,w=Math.max(1,Math.round(9-i*8/20)|1);
        R(cx-(w>>1)+hx,y+hy,w,1,BEI);
        if(w>3){R(cx-(w>>1)+hx,y+hy,1,1,BEI_S);R(cx+(w>>1)+hx,y+hy,1,1,BEI_S);}}
      // two big brow horns sweeping up and outward (drawn on top of the shield)
      for(const s of[-1,1]){
        segTap(s,10,30+hy,21,4+hy,10,3,INK,hx);
        segTap(s,10,30+hy,21,4+hy,8,1,BEI,hx);
        segTap(s,13,24+hy,21,6+hy,3,1,BEI_S,hx);}
      // plating seams on the shield surface (no face features)
      for(const s of[-1,1])for(const[sy,sw]of[[36,8],[44,10],[52,9]])
        R(cx+(s>0?15:-15-sw)+hx,sy+hy,sw,1,HULL_S);
    }
  }
}
if(!customElements.get('triceratops-sprite'))customElements.define('triceratops-sprite',TriceratopsSprite);
})();
