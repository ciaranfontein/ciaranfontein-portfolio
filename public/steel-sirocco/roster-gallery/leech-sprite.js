// <leech-sprite> — animated top-down pixel-art leech mech (faction 5 · crimson/bone).
// Soft ringed body driven by a traveling sine wave (gentle ripple idle, full swim in walk).
// Leads with a small ORAL sucker (3-jaw Y mouth); anchors on a big POSTERIOR grip-sucker.
// Layers: head (oral sucker) / frame (ringed body) / tail (posterior sucker).
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="head,frame,tail"
(function(){
const W=100,H=176;
const INK='#2A0810',HULL='#641220',HULL_L='#8A1D2E',HULL_S='#450B16',
ARM='#E01E37',ARM_S='#A01324',ARM_H='#F0455A',GRY='#7A5560',GRY_S='#553A44',
ACC='#EFE6DD',ACC_S='#C4B8AC',
BG='#454034',DOT='#3b382e',SHDW='#2A2018';
const cx=50;
// body half-profile widths — shorter (13 rings, y=48..152 step 8) and thicker (swollen mid)
const BW=[10,14,18,22,26,28,30,30,28,25,21,16,11];
class LeechSprite extends HTMLElement{
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
    // traveling wave: idle = faint ripple, walk = full swim; damped toward the oral end
    const wave=(y)=>{
      if(stat)return 0;
      const amp=mode?9:3, k=mode?0.045:0.028, sp=mode?5:1.4;
      const damp=Math.min(1,.3+Math.max(0,y-24)/100*.7);
      return Math.sin(t*sp-y*k)*amp*damp;
    };
    // disc fill helper (circle scanlines with hull shading)
    const disc=(cxo,ccy,rr,oy)=>{
      for(let y=ccy-rr;y<=ccy+rr;y++){const hw=Math.round(Math.sqrt(Math.max(0,rr*rr-(y-ccy)*(y-ccy))));if(hw<=0)continue;R(cxo-hw-1,y+oy,hw*2+2,1,INK);}
      for(let y=ccy-rr;y<=ccy+rr;y++){const hw=Math.round(Math.sqrt(Math.max(0,rr*rr-(y-ccy)*(y-ccy))))-1;if(hw<=0)continue;
        R(cxo-hw,y+oy,hw*2,1,HULL);R(cxo+hw-2,y+oy,2,1,HULL_S);R(cxo-hw,y+oy,1,1,HULL_L);}
    };
    if(mode&&!stat)this._scroll+=.5;
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadows (per layer, follow the wave)
    if(!HP('head')){const off=Math.round(wave(28));for(let y=18;y<=38;y+=2){const hw=Math.round(Math.sqrt(Math.max(0,100-(y-28)*(y-28))));if(hw>0)R(cx-hw+off+2,y+3,hw*2,2,SHDW);}}
    if(!HP('frame')){for(let i=0;i<BW.length;i++){const y=48+i*8,hw=BW[i]/2,off=Math.round(wave(y+4));R(cx-hw+off+2,y+3,BW[i],8,SHDW);}}
    if(!HP('tail')&&(this.getAttribute('tail')||'none')!=='none'){const dY=48+BW.length*8-216,off=Math.round(wave(214+dY));for(let y=211+dY;y<=237+dY;y+=2){const hw=Math.round(Math.sqrt(Math.max(0,169-(y-(224+dY))*(y-(224+dY)))));if(hw>0)R(cx-hw+off+2,y+3,hw*2,2,SHDW);}}
    // ---- tail: posterior appendage — variant via tail="sucker|fluke|barb" ----
    if(!HP('tail')){
      const bodyEnd=48+BW.length*8, dY=bodyEnd-216;
      const off=Math.round(wave(bodyEnd)), ttp=this.getAttribute('tail')||'none';
      if(ttp==='none'){
        // clean rounded posterior cap (no tail) — follows the body end
        const sh=Math.round(BW[BW.length-1]/2);
        for(let i=0;i<sh+2;i++){const y=bodyEnd+i,hw=sh-i,o=Math.round(wave(y));if(hw<=0)break;
          R(cx-hw-1+o,y,hw*2+2,1,INK);R(cx-hw+o,y,hw*2,1,HULL);R(cx+hw-3+o,y,3,1,HULL_S);R(cx-hw+o,y,1,1,HULL_L);}
      }else if(ttp==='fluke'){
        // broad flat caudal paddle (swimmer's fluke)
        const fcy=224+dY, rx=22, ry=11, pw=(y)=>{const d=(y-fcy)/ry;return Math.round(Math.sqrt(Math.max(0,1-d*d))*rx);};
        O(cx-3+off,208+dY,6,8,HULL);R(cx-1+off,208+dY,2,8,ARM_S);                     // stalk from body
        for(let y=fcy-ry;y<=fcy+ry;y++){const hw=pw(y);if(hw<=0)continue;R(cx-hw-1+off,y,hw*2+2,1,INK);}
        for(let y=fcy-ry;y<=fcy+ry;y++){const hw=pw(y)-1;if(hw<=0)continue;R(cx-hw+off,y,hw*2,1,HULL);R(cx-hw+off,y,1,1,HULL_L);R(cx+hw-2+off,y,2,1,HULL_S);}
        const bx=cx+off, by=fcy-ry+2;                                            // fin rays fanning from the stalk
        for(const k of[-20,-13,-6,0,6,13,20]){const ex=cx+off+k, ey=fcy+ry-Math.round(Math.abs(k)*ry/rx),n=Math.max(Math.abs(ex-bx),Math.abs(ey-by),1);
          for(let s2=0;s2<=n;s2++){const xx=Math.round(bx+(ex-bx)*s2/n),yy=Math.round(by+(ey-by)*s2/n);if(Math.abs(xx-bx)<pw(yy))R(xx,yy,1,1,ARM_S);}}
        for(let xo=-rx;xo<=rx;xo++){let ey=-1;for(let y=fcy;y<=fcy+ry;y++){if(Math.abs(xo)<pw(y))ey=y;}if(ey>=0&&(xo+rx)%3===0)R(cx+off+xo,ey,1,1,ACC_S);} // bone rim
      }else if(ttp==='barb'){
        // segmented taper to a bone harpoon with backward barbs
        let py=206+dY;
        for(let i=0;i<4;i++){const w=9-i*2,y=206+i*7;O(cx-w/2+off,y,w,7,i%2?ARM_S:HULL);R(cx-w/2+off,y,1,7,HULL_L);py=y+7;}
        O(cx-1+off,py,3,10,ACC_S);R(cx+off,py,1,10,ACC);                        // bone shaft
        R(cx-1+off,py+10,3,4,ACC);R(cx+off,py+14,1,4,INK);                      // spearhead + point
        R(cx-4+off,py+9,3,1,ACC);R(cx-4+off,py+9,1,4,ACC);                      // backward barbs
        R(cx+2+off,py+9,3,1,ACC);R(cx+3+off,py+9,1,4,ACC);
        R(cx-1+off,py+3,3,3,ARM);R(cx+off,py+4,1,1,ARM_H);                      // venom bead
      }else{
        // grip-sucker disc (default)
        const scy=224+dY, sr=13;
        disc(cx+off,scy,sr,0);
        for(let y=scy-8;y<=scy+8;y++){const ho=Math.round(Math.sqrt(Math.max(0,64-(y-scy)*(y-scy)))),hi=Math.round(Math.sqrt(Math.max(0,25-(y-scy)*(y-scy))));
          if(ho>hi){R(cx-ho+off,y,ho-hi,1,ARM_S);R(cx+hi+off,y,ho-hi,1,ARM_S);}}
        for(let y=scy-5;y<=scy+5;y++){const hw=Math.round(Math.sqrt(Math.max(0,25-(y-scy)*(y-scy))));if(hw>0)R(cx-hw+off,y,hw*2,1,INK);}
        R(cx-2+off,scy-2,4,4,ARM);R(cx-1+off,scy-1,2,2,ARM_H);
        for(let a=0;a<360;a+=30){const rad=a*Math.PI/180;R(cx+off+Math.round(Math.sin(rad)*(sr-1)),scy-Math.round(Math.cos(rad)*(sr-1)),1,1,ACC);}
      }
    }
    // ---- body: densely ringed soft trunk ----
    if(!HP('frame')){
      for(let i=0;i<BW.length;i++){
        const y=48+i*8,w=BW[i],hw=w/2,off=Math.round(wave(y+4));
        O(cx-hw+off,y,w,8,HULL);
        R(cx+hw-3+off,y,3,8,HULL_S);
        R(cx-hw+off,y,1,8,HULL_L);
        // bright annular ring — bands the worm every segment
        R(cx-hw-1+off,y,w+2,2,ARM_S);R(cx-hw-1+off,y+2,w+2,1,ARM);
        // paired dorsal bone spots down the back
        if(w>12){R(cx-Math.round(w*.28)+off,y+4,2,2,ACC_S);R(cx+Math.round(w*.28)-2+off,y+4,2,2,ACC_S);}
        // dark dorsal stripe
        R(cx-1+off,y,2,8,ARM_S);
      }
    }
    // ---- head: leading appendage — variant via head="sucker|sensor|drill" ----
    if(!HP('head')){
      const hoff=Math.round(wave(28)), hy=stat?0:(mode?Math.round(Math.cos(t*5)):0);
      const htp=this.getAttribute('head')||'cannon';
      // neck taper bridging into the first body segment (shared)
      for(const[y0,y1,hw]of[[40,44,4],[44,48,5]]){const no2=Math.round(wave(y0+2));R(cx-hw-1+no2,y0-1+hy,hw*2+2,y1-y0+2,INK);R(cx-hw+no2,y0+hy,hw*2,y1-y0,HULL);R(cx+hw-2+no2,y0+hy,2,y1-y0,HULL_S);R(cx-hw+no2,y0+hy,1,y1-y0,HULL_L);}
      if(htp==='cannon'){
        // laser cannon (half height): boxy barrel housing, cooling fins, glowing muzzle emitter
        const HS=[[30,34,8],[34,42,9],[42,46,7]];
        for(const[y0,y1,hw]of HS)R(cx-hw-1+hoff,y0-1+hy,hw*2+2,y1-y0+2,INK);
        for(const[y0,y1,hw]of HS)R(cx-hw+hoff,y0+hy,hw*2,y1-y0,HULL);
        for(const[y0,y1,hw]of HS){R(cx+hw-2+hoff,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hoff,y0+hy,1,y1-y0,HULL_L);}
        for(let fy=34;fy<=40;fy+=4){O(cx-13+hoff,fy+hy,4,3,GRY);R(cx-12+hoff,fy+hy,2,1,GRY_S);O(cx+9+hoff,fy+hy,4,3,GRY);R(cx+10+hoff,fy+hy,2,1,GRY_S);} // cooling fins
        R(cx-2+hoff,32+hy,4,12,ARM_S);                                                 // dark barrel channel
        R(cx-5+hoff,43+hy,10,2,ARM_S);                                                 // targeting sensor band
        O(cx-8+hoff,26+hy,16,6,GRY_S);R(cx-8+hoff,26+hy,16,1,GRY);                      // muzzle housing ring
        R(cx-5+hoff,25+hy,10,5,ARM);R(cx-3+hoff,25+hy,6,4,ARM_H);R(cx-1+hoff,26+hy,2,2,'#FFFFFF'); // glowing aperture
        R(cx-7+hoff,23+hy,2,4,ACC);R(cx+5+hoff,23+hy,2,4,ACC);                          // focusing prongs
        R(cx-1+hoff,21+hy,2,3,ARM_H);                                                   // charge spark at the tip
      }else if(htp==='sensor'){
        // flat cephalic sensor plate: broad wedge, paired eye turrets, grille mouth
        const HS=[[16,20,7],[20,28,11],[28,36,12],[36,42,8]];
        for(const[y0,y1,hw]of HS)R(cx-hw-1+hoff,y0-1+hy,hw*2+2,y1-y0+2,INK);
        for(const[y0,y1,hw]of HS)R(cx-hw+hoff,y0+hy,hw*2,y1-y0,HULL);
        for(const[y0,y1,hw]of HS){R(cx+hw-2+hoff,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hoff,y0+hy,1,y1-y0,HULL_L);}
        O(cx-9+hoff,24+hy,5,6,ARM_S);R(cx-8+hoff,25+hy,3,3,ARM_H);R(cx-8+hoff,25+hy,1,1,ACC);   // eye turrets
        O(cx+4+hoff,24+hy,5,6,ARM_S);R(cx+5+hoff,25+hy,3,3,ARM_H);R(cx+5+hoff,25+hy,1,1,ACC);
        for(const gy of[33,35,37])R(cx-6+hoff,gy+hy,12,1,INK);R(cx-6+hoff,32+hy,12,1,ARM_S);      // grille mouth
        R(cx-3+hoff,14+hy,2,3,ACC_S);R(cx+2+hoff,14+hy,2,3,ACC_S);                                // antenna nubs
      }else if(htp==='drill'){
        // armored boring drill head: sharp conic snout + helix ridges + mandibles
        const HS=[[10,16,2],[16,22,5],[22,30,8],[30,38,11],[38,44,9]];
        for(const[y0,y1,hw]of HS)R(cx-hw-1+hoff,y0-1+hy,hw*2+2,y1-y0+2,INK);
        for(const[y0,y1,hw]of HS)R(cx-hw+hoff,y0+hy,hw*2,y1-y0,HULL);
        for(const[y0,y1,hw]of HS){R(cx+hw-2+hoff,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hoff,y0+hy,1,y1-y0,HULL_L);}
        for(let i=0;i<5;i++){const y=18+i*5,seg=HS.find(([a,b])=>y>=a&&y<b)||[0,0,4];R(cx-seg[2]+hoff+((i%2)?2:-2),y+hy,seg[2]*2-2,2,ARM_S);} // helix ridges
        R(cx-1+hoff,8+hy,2,4,ACC);R(cx+hoff,7+hy,1,3,ACC_S);                                       // bone drill tip
        O(cx-13+hoff,34+hy,4,8,GRY);R(cx-12+hoff,35+hy,2,5,GRY_S);                                 // mandible plates
        O(cx+9+hoff,34+hy,4,8,GRY);R(cx+10+hoff,35+hy,2,5,GRY_S);
        R(cx-5+hoff,30+hy,10,2,ARM);R(cx-5+hoff,32+hy,10,1,ARM_S);                                 // red optic slit
      }else{
        // oral sucker with 3-jaw Y mouth (default)
        const ocy=28, orr=10;
        disc(cx+hoff,ocy,orr,hy);
        const mx=cx+hoff, my=ocy+hy;
        O(mx-4,my-4,8,8,INK);
        R(mx,my-4,1,4,ACC);
        for(let i=0;i<4;i++){R(mx-1-i,my+i,1,1,ACC);R(mx+1+i,my+i,1,1,ACC);}
        R(mx,my,1,1,ACC_S);
        for(let a=-72;a<=72;a+=24){const rad=a*Math.PI/180;R(mx+Math.round(Math.sin(rad)*orr),my-Math.round(Math.cos(rad)*orr),1,2,ACC);}
        for(const ex of[-5,-2,2,5])R(cx+ex+hoff,ocy-7+hy,1,1,ACC_S);
      }
    }
  }
}
if(!customElements.get('leech-sprite'))customElements.define('leech-sprite',LeechSprite);
})();
