import * as THREE from './vendor/three.module.js';
// Authored landmarks and street furniture, all merged into the spatial scenery batches.
export function addBoroughDetails({scene,box,at,place,trackPoint,STATIONS,M,rnd,textureCanvas,textSign}){
  const brickTex=textureCanvas(256,256,(c)=>{c.fillStyle='#77503c';c.fillRect(0,0,256,256);for(let y=0;y<256;y+=16)for(let x=-32;x<256;x+=64){c.fillStyle=((x+y)%3===0)?'#8a5a42':'#96694c';c.fillRect(x+(y/16%2)*32+1,y+1,61,13);}});brickTex.wrapS=brickTex.wrapT=THREE.RepeatWrapping;brickTex.repeat.set(2,3);
  const brickMats=['#b89b7f','#8b6d58','#af8c71','#877365'].map(color=>new THREE.MeshStandardMaterial({color,map:brickTex,roughness:.94}));
  const roof=new THREE.MeshStandardMaterial({color:'#455453',roughness:.9}),iron=new THREE.MeshStandardMaterial({color:'#263b3d',metalness:.5,roughness:.65}),stone=new THREE.MeshStandardMaterial({color:'#c5bd9e',roughness:.95}),asphalt=new THREE.MeshStandardMaterial({color:'#394d4d'}),glass=new THREE.MeshStandardMaterial({color:'#4b6868',metalness:.2,roughness:.4}),window=new THREE.MeshStandardMaterial({color:'#ccb78c',emissive:'#cba365',emissiveIntensity:.23});
  const cached=new Map();function sign(text,w,h,color,bg){const key=[text,w,h,color,bg].join('|');if(!cached.has(key))cached.set(key,textSign(text,w,h,color,bg,58));return cached.get(key).clone();}
  function beam(a,b,width=.16,height=width,mat=iron){const av=new THREE.Vector3(a.x,a.y,a.z),bv=new THREE.Vector3(b.x,b.y,b.z),v=bv.clone().sub(av);const mesh=box(width,height,v.length(),mat);mesh.position.copy(av.add(bv).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.normalize());return mesh;}
  function point(s,x,y){const p=trackPoint(s),q=trackPoint(s+1),angle=Math.atan2(-(q.x-p.x),1);return {x:p.x+Math.cos(angle)*x,y:p.y+y,z:p.z-Math.sin(angle)*x};}
  // Riveted lattice girders and cross-bracing define the elevated line at street level.
  for(let s=1160;s<2990;s+=48){for(const x of [-4.2,14.2]){const a=point(s,x,-1.5),b=point(s+48,x,-1.5);beam(a,b,.25,1.1);beam(point(s,x,-1.5),point(s+24,x,-3),.16);beam(point(s+24,x,-3),point(s+48,x,-1.5),.16);place(box(.8,30,.8,iron),s,x,-16);place(box(2.1,.25,1.4,stone),s,x,-30.7);}
    beam(point(s,-4.2,-4),point(s,14.2,-4),.32,.5);beam(point(s,-4.2,-3),point(s,14.2,-8),.18);beam(point(s,14.2,-3),point(s,-4.2,-8),.18);
  }
  // Through-truss river crossing: a deliberate landmark between two neighbourhoods.
  for(let s=1370;s<1600;s+=40){for(const x of [-4.4,14.4]){beam(point(s,x,.5),point(s+40,x,10),.35);beam(point(s,x,10),point(s+40,x,.5),.35);beam(point(s,x,10),point(s+40,x,10),.42);beam(point(s,x,.5),point(s,x,10),.32);}beam(point(s,-4.4,10),point(s,14.4,10),.3,.35);}
  // Waterfront piers, barges and current streaks keep the water distinct from the street grid.
  const water=new THREE.MeshBasicMaterial({color:'#86a7a0',transparent:true,opacity:.28});for(let i=0;i<60;i++){const s=1290+rnd()*370,x=-150+rnd()*500;at(box(2+rnd()*9,.02,.12,water),x,-6.43,-s);}
  for(const s of [1290,1650]){const p=trackPoint(s);at(box(100,1.3,12,roof),p.x-125,-6,-s);for(let x=-170;x<-80;x+=14)at(box(1,9,1,iron),p.x+x,-10,-s);}
  const barge=trackPoint(1480);at(box(12,1.6,34,iron),barge.x-90,-5.8,barge.z);at(box(9,2.1,9,brickMats[1]),barge.x-90,-3.95,barge.z+8);at(box(3,1.6,4,stone),barge.x-90,-2.1,barge.z+13);
  // The close streets are low-rise masonry, unlike the distant skyline towers.
  for(let s=1110;s<2980;s+=95){if(s>1260&&s<1700)continue;const p=trackPoint(s);for(const side of [-1,1]){const x=p.x+side*(58+rnd()*22),z=-s,w=23+rnd()*10,d=26+rnd()*13,floors=3+Math.floor(rnd()*4),h=floors*3.2;
      at(box(w,h,d,brickMats[Math.floor(rnd()*4)]),x,-8+h/2,z);at(box(w+1,.5,d+1,stone),x,h-7.8,z);at(box(w-1,.18,d-1,roof),x,h-7.45,z);
      for(let floor=0;floor<floors;floor++){for(let off=-w/2+3;off<w/2-1;off+=4){const y=-6.3+floor*3.2;at(box(1.4,1.9,.08,iron),x+off,y,z+d/2+.06);at(box(1.15,1.58,.09,window),x+off,y,z+d/2+.12);at(box(1.8,.16,.4,stone),x+off,y-.98,z+d/2+.14);}at(box(w+.2,.12,.16,stone),x,-5.05+floor*3.2,z+d/2+.06);}
      // Fire escape: landing, rail and diagonal stair flights.
      for(let floor=1;floor<floors;floor++){const y=-7+floor*3.2;at(box(3.1,.12,1.1,iron),x,y,z+d/2+.8);at(box(3.2,.12,.08,iron),x,y+1,z+d/2+1.3);for(const off of [-1.5,0,1.5])at(box(.08,1,.08,iron),x+off,y+.5,z+d/2+1.3);beam({x:x-1.3,y,z:z+d/2+1.2},{x:x+1.3,y:y-3.2,z:z+d/2+1.2},.12,.22);}
      if(rnd()>.35){const tank=new THREE.Mesh(new THREE.CylinderGeometry(1.9,2.1,3.4,10),brickMats[2]);at(tank,x+w*.22,h-5.3,z-3);scene.add(tank);const cap=new THREE.Mesh(new THREE.ConeGeometry(2.1,.9,10),iron);at(cap,x+w*.22,h-3.15,z-3);scene.add(cap);for(const dx of [-1.4,1.4])for(const dz of [-1.4,1.4])at(box(.12,2,.12,iron),x+w*.22+dx,h-7.2,z-3+dz);}
      // A corner storefront awning and cornice ground each block.
      at(box(w*.75,.25,2.4,side<0?M.dark:M.orange),x,-4.9,z+d/2+1.1);at(box(w*.76,2.7,.09,glass),x,-6.3,z+d/2+.08);
      const pavX=p.x+side*34;at(box(11,.25,90,stone),pavX,-7.85,z);at(box(7,.18,92,asphalt),p.x+side*24,-7.98,z);
  }}
  // Crosswalks, curbside cars and lamp posts add a human scale below the rails.
  const carMats=['#d8a52f','#a7b7b2','#486d72','#a45036'].map(color=>new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.55}));
  for(let s=1170;s<2950;s+=58){if(s>1250&&s<1710)continue;const p=trackPoint(s),side=s%116===10?-1:1,x=p.x+side*25;at(box(1.8,.75,4.2,carMats[Math.floor(rnd()*4)]),x,-7.25,-s);at(box(1.5,.65,2.1,glass),x,-6.65,-s);for(const dx of [-.88,.88])for(const dz of [-1.25,1.25])at(box(.2,.55,.65,M.black),x+dx,-7.5,-s+dz);if(rnd()>.65)at(box(.9,.18,.38,M.yellow),x,-6.23,-s);
    for(const side of [-1,1]){const lx=p.x+side*32;at(box(.15,7,.15,iron),lx,-4.35,-s);at(box(2.2,.13,.13,iron),lx-side*.9,-.9,-s);at(box(.65,.12,.32,M.light),lx-side*1.8,-.96,-s);}}
  for(const s of [1140,1770,2250,2730]){const p=trackPoint(s);for(let i=-5;i<=5;i++)at(box(1.4,.045,12,stone),p.x+i*2.4,-7.88,-s);}
  // Tiled station identities, exit stairs, route diagrams and poster cases.
  const accents=['#448b7a','#b18d53','#638f9b','#a6664c','#737d9a'];
  const mapTex=textureCanvas(512,640,(c)=>{c.fillStyle='#ebe4ce';c.fillRect(0,0,512,640);c.fillStyle='#263e42';c.font='bold 30px Arial';c.fillText('BOROUGH LINE',30,46);c.font='18px Arial';c.fillText('CANAL STREET → ASTORIA',30,77);c.strokeStyle='#eb7c40';c.lineWidth=9;c.beginPath();c.moveTo(55,126);c.lineTo(55,333);c.stroke();STATIONS.forEach((st,i)=>{const y=128+i*48;c.fillStyle='#ebe4ce';c.beginPath();c.arc(55,y,8,0,Math.PI*2);c.fill();c.strokeStyle='#263e42';c.lineWidth=2;c.stroke();c.fillStyle='#263e42';c.font='bold 20px Arial';c.fillText(st.name,82,y+7);});});
  const mapMat=new THREE.MeshBasicMaterial({map:mapTex,side:THREE.DoubleSide});
  STATIONS.forEach((st,index)=>{const side=st.side==='right'?1:-1,accent=new THREE.MeshStandardMaterial({color:accents[index%accents.length],roughness:.9});
    for(let off=-102;off<=68;off+=17){place(box(.05,.38,17.1,accent),st.at+off,side*7.56,3.6);for(const x of [side*6.7]){place(box(.33,.15,.36,M.yellow),st.at+off,x,1.2);place(box(.32,.16,.36,M.orange),st.at+off,x,3.9);}}
    const front=sign(st.name.toUpperCase(),5.5,.75,'#f5f0dc','#1a3338');place(front,st.at-98,side*4.7,4.7);
    const sideName=sign(st.name.toUpperCase(),6,.8,'#e9eadb',accents[index%accents.length]);place(sideName,st.at+35,side*7.5,3.3);sideName.rotation.y=-side*Math.PI/2;
    for(const off of [-39,20]){const map=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3.1),mapMat);scene.add(map);place(map,st.at+off,side*7.46,2.5);map.rotation.y=-side*Math.PI/2;place(box(.1,2.4,3.1,iron),st.at+off,side*7.55,2.5);}
    const exit=sign('EXIT  ↑  STREET',2.9,.5,'#f8e6b9','#48785d');place(exit,st.at+48,side*5.4,4.6);
    // Two stair flights framed as a real station exit rather than a dead platform.
    for(let i=0;i<12;i++){place(box(2.7,.26,.68,stone),st.at+46+i*.65,side*9.4,1.1+i*.23);}
    place(box(3.2,.2,4.8,iron),st.at+54,side*9.4,3.8);place(box(.15,3,.15,iron),st.at+49,side*8,2.7);place(box(.15,3,.15,iron),st.at+49,side*10.8,2.7);
    const kiosk=place(box(1.2,2.2,.65,iron),st.at-45,side*6.9,2.15);const screen=sign('B  LOCAL',.7,.4,'#e5b87c','#16292d');place(screen,st.at-44.64,side*6.9,2.65);
    // Warm fixture pools are baked into small emissive platform fittings.
    for(const off of [-55,-20,15,50]){place(box(.5,.1,2.2,M.light),st.at+off,side*4.6,5.76);}
  });
  // Tunnel ribs, utility cabinets, cross-passages and close trackside marker plates.
  for(let s=110;s<820;s+=30){for(const x of [-7.4,16.4])place(box(.28,6,.3,iron),s,x,2.8);place(box(24,.2,.3,iron),s,4.5,6.16);if(s%90===20){place(box(.55,2.1,1.2,iron),s,-7.1,1.4);const marker=sign(String(Math.round(s/10)),.6,.45,'#e2e0c9','#1b3031');place(marker,s,-6.7,2.8);marker.rotation.y=Math.PI/2;}}
}
