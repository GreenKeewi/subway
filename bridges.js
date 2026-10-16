import * as THREE from './vendor/three.module.js';
// Endpoint frames follow the actual curved/graded track. Adjacent sections share
// exactly the same edge vertices, including the sealed underside and sidewalls.
export const DECK_RANGES=[[820,3420],[4700,7350]];
export function deckPoint(trackPoint,s,x,y){
 const p=trackPoint(s),a=trackPoint(s-.01),b=trackPoint(s+.01),dx=b.x-a.x,dz=b.z-a.z,n=Math.hypot(dx,dz);
 return{x:p.x-dz/n*x,y:p.y+y,z:p.z+dx/n*x};
}
export function deckGeometry(trackPoint,from,to){
 const positions=[],indices=[],steps=Math.ceil((to-from)/4);
 for(let i=0;i<=steps;i++){const s=from+(to-from)*i/steps;for(const [x,y]of[[-4.8,-.5],[14.8,-.5],[-4.8,-1.25],[14.8,-1.25]]){const p=deckPoint(trackPoint,s,x,y);positions.push(p.x,p.y,p.z);}}
 const quad=(a,b,c,d)=>indices.push(a,b,c,a,c,d);
 for(let i=0;i<steps;i++){const k=i*4,n=k+4;quad(k,k+1,n+1,n);quad(k+2,n+2,n+3,k+3);quad(k,n,k+2+4,k+2);quad(k+1,k+3,n+3,n+1);}
 quad(0,2,3,1);const n=steps*4;quad(n,n+1,n+3,n+2);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export function addBridgeDecks({scene,box,place,trackPoint,M}){
 const concrete=new THREE.MeshStandardMaterial({color:'#646e63',roughness:.95}),steel=M.dark;
 for(const [from,to]of DECK_RANGES){
  for(let s=from;s<to;s+=80){const mesh=new THREE.Mesh(deckGeometry(trackPoint,s,Math.min(s+80,to)),concrete);mesh.name='Continuous bridge deck';scene.add(mesh);}
  for(let s=from+6;s<to;s+=12){place(box(19.8,.45,.5,steel),s,5,-1.5);}
  for(let s=from+12;s<to;s+=24){
   // Leave navigable water spans open; trusses carry the river crossings.
   if(s>1255&&s<1685||s>6615&&s<6855)continue;
   const top=trackPoint(s).y-1.25,ground=-8,height=top-ground;
   for(const x of[-4.2,14.2]){const center=deckPoint(trackPoint,s,x,0);box(.8,height,.8,steel).position.set(center.x,(top+ground)/2,center.z);box(2.1,.5,1.8,M.platform).position.set(center.x,ground-.25,center.z);}
  }
 }
}
