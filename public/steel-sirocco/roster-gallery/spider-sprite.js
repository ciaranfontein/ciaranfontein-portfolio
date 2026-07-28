// <spider-sprite> — animated top-down pixel-art spider mech (faction 1 · rot greens + venom purple).
// Big cephalothorax + abdomen with a purple diamond mark; 8 long splayed stepped legs
// in an alternating-tetrapod scuttle. Layers: head / legsA (front 4) / legsB (rear 4) / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=160,H=210;
const INK='#052E16',HULL='#33691E',HULL_L='#4A8629',HULL_S='#224712',
PALE='#E8F2D8',PALE_S='#BFD3A6',GRY='#6F7F5C',GRY_S='#4E5A40',
ACC='#C9E265',ACC_S='#96AE3B',
PUR='#9D4EDD',PUR_S='#7A35C4',PUR_D='#10002B',
BG='#454034',DOT='#3b382e',SHDW='#343c28';
const cx=80;
// cephalothorax + abdomen spans [y0,y1,halfw]
const CT=[[52,60,14],[60,78,19],[78,92,18],[92,98,11]];
const AB=[[98,108,18],[108,122,24],[122,142,28],[142,158,24],[158,170,18],[170,178,11]];
// leg anchors: [y, halfw, elbow dx, elbow dy, tip dx, tip dy] — front pairs rake up, rear rake down
const LEGS=[[58,15,13,-13,21,-6],[71,19,14,-6,21,-1],[84,18,14,6,21,1],[94,12,13,13,20,6]];
class SpiderSprite extends HTMLElement{
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
    let bob=0;
    if(mode===0)bob=Math.round(Math.sin(t*1.7)*1);
    else bob=Math.round(Math.sin(t*16)*.6);
    if(stat)bob=0;
    const ph=t*8;
    if(mode&&!stat)this._scroll+=.5;
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (body only, like the other frames)
    if(!HP('head'))R(cx-9+2,15+bob+3,18,35,SHDW);
    if(!HP('frame')){
      for(let i=0;i<CT.length;i++)R(cx-CT[i][2]+2,CT[i][0]+bob+3,CT[i][2]*2,CT[i][1]-CT[i][0],SHDW);
      for(let i=0;i<AB.length;i++)R(cx-AB[i][2]+2,AB[i][0]+bob+3,AB[i][2]*2,AB[i][1]-AB[i][0],SHDW);
    }
    // ---- legs (bottom layer): two-segment arches drawn as contiguous pixel lines ----
    const seg=(x0,y0,x1,y1,th,c)=>{
      const dx=x1-x0,dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy),1),o=Math.floor(th/2);
      for(let i=0;i<=n;i++){const x=Math.round(x0+dx*i/n),y=Math.round(y0+dy*i/n);R(x-o,y-o,th,th,c);}
    };
    const leg=(s,i)=>{
      const[ly0,hw,aox,aoy,box_,boy]=LEGS[i];
      const ly=ly0+bob;
      // alternating tetrapod: legs 0,2 left + 1,3 right swing together
      const grp=(i+ (s>0?1:0))%2;
      const sw=stat?0:(mode?Math.round(Math.sin(ph+grp*Math.PI)*3):Math.round(Math.sin(t*1.5+i*1.3)*1));
      const ext=stat?0:(mode?Math.round(Math.cos(ph+grp*Math.PI)*1):0);
      const ax=cx+s*hw, ex=ax+s*(aox+ext), ey=ly+aoy+Math.round(sw*.6);
      const tx=ex+s*box_, ty=ey+boy+Math.round(sw*.4);
      R(tx+(s>0?1:-4),ty-1,3,3,PALE);                           // tarsus tip first — bottom layer, pokes past the tibia
      seg(ax,ly,ex,ey,5,INK);seg(ex,ey,tx,ty,4,INK);           // outline pass
      seg(ax,ly,ex,ey,3,HULL);seg(ex,ey,tx,ty,2,HULL_S);       // femur + tibia
      O(ex-2,ey-2,4,4,GRY);                                     // knee joint
      O(ax+(s>0?-2:-3),ly-2,5,5,GRY);                           // shoulder, tucked into the hull edge
    };
    if(!HP('legsA')){leg(-1,0);leg(1,0);leg(-1,1);leg(1,1);}
    if(!HP('legsB')){leg(-1,2);leg(1,2);leg(-1,3);leg(1,3);}
    // ---- frame: cephalothorax + abdomen ----
    if(!HP('frame')){
      for(const[y0,y1,hw]of CT)R(cx-hw-1,y0-1+bob,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of CT)R(cx-hw,y0+bob,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of CT){R(cx+hw-3,y0+bob,3,y1-y0,HULL_S);R(cx-hw,y0+bob,1,y1-y0,HULL_L);}
      for(const[y0,y1,hw]of AB)R(cx-hw-1,y0-1+bob,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of AB)R(cx-hw,y0+bob,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of AB){R(cx+hw-3,y0+bob,3,y1-y0,HULL_S);R(cx-hw,y0+bob,1,y1-y0,HULL_L);}
      // cephalothorax spine + seam
      R(cx-1,52+bob,3,46,HULL_S);R(cx-1,52+bob,1,46,HULL_L);
      R(cx-13,78+bob,26,1,HULL_S);
      // purple diamond mark on the abdomen
      const DM=[[124,4],[129,9],[134,12],[139,9],[144,4]];
      for(const[y,hw]of DM)R(cx-hw,y+bob,hw*2,5,PUR);
      R(cx-6,134+bob,1,5,PUR_S);R(cx+5,134+bob,1,5,PUR_S);
      R(cx-1,134+bob,2,2,PUR_D);
      // spinneret stud at the rear
      O(cx-2,172+bob,4,4,GRY);R(cx-1,173+bob,2,2,PUR);
    }
    // ---- head: front cap, eye array, fangs ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*13)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=mode?0:hb, hy=bob+(mode?hb:0);
      const HS=[[38,44,8],[44,48,10],[48,52,11]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // chelicerae plate + big paired fang blades curving inward, venom-tipped
      O(cx-6+hx,34+hy,12,4,GRY_S);R(cx-6+hx,34+hy,12,1,GRY);
      // fangs: deep outward bow, curling back to forward venom points between the tips
      R(cx-7+hx,29+hy,4,4,GRY);R(cx+3+hx,29+hy,4,4,GRY);
      R(cx-9+hx,25+hy,3,4,GRY);R(cx+6+hx,25+hy,3,4,GRY);
      R(cx-8+hx,22+hy,2,3,GRY_S);R(cx+6+hx,22+hy,2,3,GRY_S);
      R(cx-6+hx,20+hy,2,2,GRY_S);R(cx+4+hx,20+hy,2,2,GRY_S);
      R(cx-4+hx,18+hy,1,2,GRY_S);R(cx+3+hx,18+hy,1,2,GRY_S);
      R(cx-4+hx,16+hy,1,2,GRY_S);R(cx+3+hx,16+hy,1,2,GRY_S);
      R(cx-3+hx,15+hy,1,2,PUR);R(cx+2+hx,15+hy,1,2,PUR);
      // eye cluster — big main pair + secondary pair, purple glow
      R(cx-4+hx,40+hy,3,3,PUR);R(cx+1+hx,40+hy,3,3,PUR);
      R(cx-8+hx,41+hy,2,2,PUR);R(cx+6+hx,41+hy,2,2,PUR);
      R(cx-8+hx,44+hy,16,1,PUR_S);
    }
  }
}
if(!customElements.get('spider-sprite'))customElements.define('spider-sprite',SpiderSprite);
})();
