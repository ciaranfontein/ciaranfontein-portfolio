// <salamander-sprite> — animated top-down pixel-art salamander mech (faction 2 · ember corals).
// Long low sprawler: wide blunt head with eye bulges, undulating body (S-curve wave in
// walk), splayed two-segment legs with fanned toes, thick tapering tail. Red spot rows.
// Layers: head / legsA / legsB / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=150,H=280;
const INK='#2E2A28',HULL='#E76F51',HULL_L='#F0937C',HULL_S='#B85039',
ARM='#514843',ARM_S='#3B3430',ARM_H='#665A53',GRY='#8A7A72',GRY_S='#635850',
RED='#D62828',RED_S='#A31D1D',
BG='#454034',DOT='#3b382e',SHDW='#3a352f';
const cx=75;
// body silhouette spans [y0,y1,halfw]
const SP=[[50,60,13],[60,74,15],[74,90,16],[90,108,17],[108,126,17],[126,142,16],[142,156,14],[156,170,12]];
// tail segment halfwidths, y=170 step 8
const TW=[10,9,8,7,7,6,5,5,4,3,3,2];
class SalamanderSprite extends HTMLElement{
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
    const seg=(x0,y0,x1,y1,th,c)=>{
      const dx=x1-x0,dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy),1),o=Math.floor(th/2);
      for(let i=0;i<=n;i++){const x=Math.round(x0+dx*i/n),y=Math.round(y0+dy*i/n);R(x-o,y-o,th,th,c);}
    };
    const ph=t*5;
    let bob,tailS,st4;
    if(mode===0){bob=Math.round(Math.sin(t*1.6)*1);tailS=Math.sin(t*1.2)*5;st4=[0,0,0,0];}
    else{bob=Math.round(Math.sin(ph*2)*1);tailS=Math.sin(ph)*4;
      this._scroll+=.45;
      const a=Math.round(Math.sin(ph)*5),b=Math.round(Math.sin(ph+Math.PI)*5);st4=[a,b,b,a];}
    if(stat){bob=0;tailS=0;st4=[0,0,0,0];}
    // serpentine body wave (walk only), damped toward the head
    const wave=(y)=>{
      if(stat||mode===0)return 0;
      const damp=Math.min(1,.4+Math.max(0,y-40)/110*.6);
      return Math.sin(t*5-y*.045)*3*damp;
    };
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('head')){for(const[y,hw]of[[16,7],[24,12],[34,13],[42,10]]){const off=Math.round(wave(y));R(cx-hw+off+2,y+3+bob,hw*2,9,SHDW);}}
    if(!HP('frame')){for(let i=0;i<SP.length;i++){const[y0,y1,hw]=SP[i];const off=Math.round(wave(y0));R(cx-hw+off+2,y0+bob+3,hw*2,y1-y0,SHDW);}}
    if(!HP('tail')){for(let i=0;i<TW.length;i++){const y=170+i*8,hw=TW[i];const off=Math.round(wave(y)+tailS*(i+1)/TW.length);R(cx-hw+off+2,y+bob+3,hw*2,8,SHDW);}}
    // ---- legs (bottom layer): splayed sprawler limbs with fanned toes ----
    const leg=(s,front,i)=>{
      const ly=(front?64:148)+bob;
      const stride=st4[i];
      const aoff=Math.round(wave(front?64:148));
      const ax=cx+s*(front?14:13)+aoff;
      const ex=ax+s*7, ey=ly+(front?-2:2);
      const fx=ex+s*6, fy=ey+(front?-3:3)+stride;
      // foot: chunky pad with scalloped toe bumps, drawn under the limb
      O(fx-5,fy-4,11,9,HULL);R(fx-5,fy+3,11,2,HULL_S);
      O(fx-5,fy-8,3,4,HULL_L);O(fx-1,fy-9,3,5,HULL_L);O(fx+3,fy-8,3,4,HULL_L);
      seg(ax,ly,ex,ey,11,INK);seg(ex,ey,fx,fy,9,INK);
      seg(ax,ly,ex,ey,9,HULL);seg(ex,ey,fx,fy,7,HULL_S);
      O(ex-3,ey-3,7,7,GRY);                                    // elbow
    };
    if(!HP('legsA')){leg(-1,true,0);leg(1,true,1);}
    if(!HP('legsB')){leg(-1,false,2);leg(1,false,3);}
    // ---- tail ----
    if(!HP('tail')){
      for(let i=0;i<TW.length;i++){
        const y=170+i*8+bob,hw=TW[i];
        const off=Math.round(wave(y)+tailS*(i+1)/TW.length);
        O(cx-hw+off,y,hw*2,8,i%2?HULL:HULL_L);
        R(cx+hw-2+off,y,2,8,HULL_S);
        if(i===2||i===5){R(cx-1+off,y+2,3,3,RED);R(cx-1+off,y+4,3,1,RED_S);}
      }
      const tp=Math.round(wave(262)+tailS);
      R(cx-1+tp,262+bob,2,3,HULL_S);                            // tip nub
    }
    // ---- body ----
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP){const off=Math.round(wave(y0));R(cx-hw-1+off,y0-1+bob,hw*2+2,y1-y0+2,INK);}
      for(const[y0,y1,hw]of SP){const off=Math.round(wave(y0));R(cx-hw+off,y0+bob,hw*2,y1-y0,HULL);}
      for(const[y0,y1,hw]of SP){const off=Math.round(wave(y0));R(cx+hw-3+off,y0+bob,3,y1-y0,HULL_S);R(cx-hw+off,y0+bob,1,y1-y0,HULL_L);}
      // dorsal groove
      for(const[y0,y1]of SP){const off=Math.round(wave(y0));R(cx-1+off,y0+bob,3,y1-y0,ARM);R(cx-1+off,y0+bob,1,y1-y0,ARM_H);}
      // fire-spot rows: paired on odd spans, single on even
      for(const[y,paired]of[[66,1],[82,0],[96,1],[116,0],[130,1],[148,0]]){
        const off=Math.round(wave(y));
        if(paired){R(cx-9+off,y+bob,3,3,RED);R(cx-9+off,y+bob+2,3,1,RED_S);R(cx+6+off,y+bob,3,3,RED);R(cx+6+off,y+bob+2,3,1,RED_S);}
        else{R(cx-1+off,y+bob,3,3,RED);R(cx-1+off,y+bob+2,3,1,RED_S);}
      }
      // panel seams
      for(const y of[74,108,142]){const off=Math.round(wave(y));R(cx-10+off,y+bob,20,1,HULL_S);}
    }
    // ---- head: wide, blunt, eye bulges ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*10)*1):Math.round(Math.sin(t*1.1)*1));
      const hoff=Math.round(wave(28));
      const hx=hoff+(mode?0:hb), hy=bob+(mode?hb:0);
      const HS=[[14,18,6],[18,24,10],[24,34,13],[34,42,13],[42,50,10]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // eye indents: shallow top-down dimples, no bulges
      R(cx-8+hx,25+hy,2,2,HULL_S);R(cx-8+hx,27+hy,2,1,ARM_S);
      R(cx+6+hx,25+hy,2,2,HULL_S);R(cx+6+hx,27+hy,2,1,ARM_S);
      // nostrils
      R(cx-3+hx,16+hy,1,1,INK);R(cx+2+hx,16+hy,1,1,INK);
    }
  }
}
if(!customElements.get('salamander-sprite'))customElements.define('salamander-sprite',SalamanderSprite);
})();
