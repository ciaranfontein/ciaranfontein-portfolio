// <octopus-sprite> — animated top-down pixel-art octopus mech (faction 9 · mauve/violet).
// Bulbous armoured mantle with papillae studs and siphon vents; eight ROBOT arms — three rigid
// straight metal links each (4 segments on a loose whip cascade — each joint lags and swings wider),
// only shallow socket dimples shaded into the mantle. Layers: head / legsA / legsB / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=190,H=230;
const INK='#10002B',HULL='#B497BD',HULL_L='#D9C6E0',HULL_S='#8A6B96',
ARM='#9D4EDD',ARM_S='#5A1E8C',ARM_H='#C79BF0',GRY='#6E5A80',GRY_S='#493459',
SUC='#E8D8F0',SUC_S='#A88BB8',
BG='#454034',DOT='#3b382e',SHDW='#08001A';
const cx=95;
// mantle spans [y0,y1,halfw] — bulbous dome tapering into the collar
const MS=[[22,28,14],[28,34,20],[34,42,26],[42,54,30],[54,66,31],[66,78,28],[78,88,22],[88,94,15]];
// eight arms (four mirrored pairs): control path in half-space, root → tip
const TENT=[
  [[11,92],[32,76],[52,64],[67,52],[74,38]],
  [[16,98],[42,92],[64,86],[78,76],[83,63]],
  [[16,104],[42,110],[63,119],[75,132],[77,148]],
  [[11,108],[28,128],[39,150],[43,172],[38,190]],
];
class OctopusSprite extends HTMLElement{
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
    const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
    let bob,swayX,pulse,spd,amp;
    if(mode===0){bob=Math.round(Math.sin(t*1.5)*1);swayX=0;pulse=Math.sin(t*1.5);spd=1.5;amp=3;}
    else{const ph=t*4.2;bob=Math.round(Math.sin(ph)*1);swayX=Math.round(Math.sin(ph*.5)*1);
      pulse=Math.sin(ph);this._scroll+=.5;spd=4.2;amp=6;}
    if(stat){bob=0;swayX=0;pulse=0;amp=0;}
    // mantle jet-pulse: the dome swells and slims as it breathes
    const jet=Math.round(pulse*1.6);
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<90;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow under the mantle
    if(!HP('frame')){for(const[y0,y1,hw]of MS)R(cx-hw+swayX+4,y0+bob+5,hw*2,y1-y0,SHDW);}
    // ---- arms: three rigid straight links per arm, joined by circular hinges ----
    const armStroke=(j,s,pass)=>{
      const ROOT=[[10,94],[17,90],[21,84],[22,77]][j];
      const A0=[68,31,-7,-46][j]*Math.PI/180;                      // fan spread widened 10%
      const L=[22,19,17,15], TH=[9,8,6,5], NSEG=4;
      const ph=t*spd+j*1.1+(s>0?0:.55);
      // loose whip cascade: each joint lags the last and swings wider toward the tip
      const D=stat?[0,16,14,12]:[Math.sin(ph)*8,16+Math.sin(ph+.7)*11,
        14+Math.sin(ph+1.5)*13,12+Math.sin(ph+2.3)*15];
      let px2=ROOT[0], py2=ROOT[1], ang=A0+D[0]*Math.PI/180;
      const joints=[[px2,py2,TH[0]]];
      for(let k=0;k<NSEG;k++){
        if(k>0)ang+=D[k]*Math.PI/180;
        const ex=px2+Math.cos(ang)*L[k], ey=py2+Math.sin(ang)*L[k], th=TH[k];
        const n=Math.max(Math.abs(ex-px2),Math.abs(ey-py2),1);
        for(let i=0;i<=n;i++){                                   // dead-straight metal link
          const qx=px2+(ex-px2)*i/n, qy=py2+(ey-py2)*i/n;
          const x=cx+(s>0?sym(qx):-sym(qx))+swayX, y=Math.round(qy)+bob;
          if(pass===0)R(x-((th+2)/2|0),y-((th+2)/2|0),th+2,th+2,INK);
          else{R(x-((th/2)|0),y-((th/2)|0),th,th,k===0?HULL:HULL_S);
            R(x-((th/2)|0),y-((th/2)|0),1,1,HULL_L);}             // hard highlight edge
        }
        px2=ex;py2=ey;joints.push([ex,ey,TH[k]]);
      }
      if(pass===1){                                              // circular hinge disc at every joint
        for(const[jx,jy,th]of joints){
          const x=cx+(s>0?sym(jx):-sym(jx))+swayX, y=Math.round(jy)+bob, r=Math.max(2,((th+1)/2)|0);
          for(let d=-r;d<=r;d++){const w=Math.round(Math.sqrt(Math.max(0,r*r-d*d)));if(w<=0)continue;
            R(x-w,y+d,w*2+1,1,INK);}
          for(let d=-r+1;d<=r-1;d++){const w=Math.round(Math.sqrt(Math.max(0,(r-1)*(r-1)-d*d)));if(w<=0)continue;
            R(x-w,y+d,w*2+1,1,GRY);}
          R(x-1,y-1,3,3,GRY_S);R(x,y,1,1,ARM_H);}                 // hub + bright pin
      }
    };
    const front=[0,1], rear=[2,3];
    for(const pass of[0,1]){
      if(!HP('legsB'))for(const j of rear)for(const s of[-1,1])armStroke(j,s,pass);
      if(!HP('legsA'))for(const j of front)for(const s of[-1,1])armStroke(j,s,pass);
    }
    // ---- frame: collar skirt joining the arms to the mantle ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(let y=84;y<=98;y++){const hw=Math.round(20-(y-84)*.9);
        R(cx-hw-1+ox,y+oy,hw*2+2,1,INK);}
      for(let y=84;y<=97;y++){const hw=Math.round(20-(y-84)*.9);
        R(cx-hw+ox,y+oy,hw*2,1,HULL_S);
        if((y-84)%3===0)R(cx-hw+2+ox,y+oy,hw*2-4,1,GRY);}         // collar bands
      R(cx-6+ox,86+oy,12,3,ARM_S);R(cx-5+ox,87+oy,10,1,ARM);      // mouth plate (beak housing)
    }
    // ---- head: armoured mantle dome ----
    if(!HP('head')){
      const ox=swayX,oy=bob;
      const jw=(y)=>y<58?jet:-jet;                                // dome swells at the top as it jets
      for(const[y0,y1,hw]of MS)for(let y=y0;y<y1;y++){const h2=hw+jw(y);
        R(cx-h2-1+ox,y-1+oy,h2*2+2,1,INK);}
      for(const[y0,y1,hw]of MS)for(let y=y0;y<y1;y++){const h2=hw+jw(y);
        R(cx-h2+ox,y+oy,h2*2,1,HULL);
        R(cx+h2-4+ox,y+oy,4,1,HULL_S);R(cx-h2+ox,y+oy,4,1,HULL_S);}   // symmetric rim shading
      // papillae studs — mirrored pairs of raised skin bumps
      for(const[bx,by]of[[8,34],[16,44],[6,52],[20,58],[10,66],[18,74],[4,80]]){
        for(const s of[-1,1]){const x=cx+(s>0?sym(bx):-sym(bx))+ox;
          R(x-1,by+oy,3,3,HULL_L);R(x-1,by+2+oy,3,1,HULL_S);}}
      // shallow socket dimples — the only nod to eyes from directly above
      for(const s of[-1,1]){const x=cx+(s>0?sym(24):-sym(24))+ox;
        R(x-2,60+oy,5,3,HULL_S);R(x-1,61+oy,3,1,GRY_S);}
      // dorsal seam + siphon vents
      R(cx-2+ox,26+oy,5,64,ARM_S);R(cx-1+ox,26+oy,3,64,ARM);R(cx+ox,26+oy,1,64,ARM_H);
      for(const s of[-1,1]){const x=cx+(s>0?sym(13):-sym(13))+ox;
        R(x-3,78+oy,7,6,INK);R(x-2,79+oy,5,4,GRY_S);R(x-2,79+oy,5,1,ARM);}
    }
  }
}
if(!customElements.get('octopus-sprite'))customElements.define('octopus-sprite',OctopusSprite);
})();
