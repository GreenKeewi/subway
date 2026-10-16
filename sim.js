export const STATIONS = [
  {name:'Canal Street',at:0,side:'right',due:0,zone:'underground'},
  {name:'Bowery',at:640,side:'left',due:85,zone:'underground'},
  {name:'East River',at:1310,side:'right',due:173,zone:'elevated'},
  {name:'Grand Avenue',at:2100,side:'left',due:275,zone:'elevated'},
  {name:'Queens Terminal',at:2800,side:'right',due:370,zone:'elevated'}
];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function speedLimit(s){return s<760?19:s<1090?15:s<1540?18:s<2280?22:18;}
export function trackPoint(s){return {x:90*Math.sin(s/700)+.035*s,y:s<820?0:s>1160?20:20*(1-Math.cos((s-820)/340*Math.PI))/2,z:-s};}
export class SubwaySim {
  constructor(){this.reset();}
  reset(){Object.assign(this,{s:0,v:0,handle:0,time:0,next:0,doors:'right',dwell:0,phase:'service',score:0,stops:[],assist:false,emergency:false,signalHold:0,signalCleared:false,penalties:0,message:'Welcome aboard. Let passengers board, then close the right doors with D.',messageAge:0,lastAction:'',prevS:0});}
  announce(text){this.message=text;this.messageAge=0;}
  get station(){return STATIONS[this.next]||null;}
  get distance(){return this.station?this.station.at-this.s:0;}
  get aligned(){return !!this.station&&Math.abs(this.distance)<19&&this.v<.3;}
  get signal(){if(this.signalCleared||this.s>1030)return 'green';if(this.s>690)return 'red';return 'green';}
  get safeSpeed(){let limit=speedLimit(this.s);if(this.station&&this.distance>0)limit=Math.min(limit,Math.sqrt(Math.max(0,this.distance-3)*1.5));if(!this.signalCleared&&this.s>650&&this.s<1030)limit=Math.min(limit,Math.sqrt(Math.max(0,1020-this.s)*1.45));return limit;}
  toggleDoors(side){
    if(this.phase!=='service')return false;
    if(this.doors){if(this.dwell<4){this.announce('Boarding passengers · wait '+Math.ceil(4-this.dwell)+' seconds.');return false;}const stop=this.station;this.doors=null;this.handle=0;this.stops.push({name:stop.name,error:Math.round(this.s-stop.at),time:this.time});this.score+=Math.max(50,150-Math.round(Math.abs(this.s-stop.at)*3));this.next++;if(!this.station){this.phase='complete';this.announce('End of the line. All passengers delivered.');}else this.announce('Doors locked. Next stop: '+this.station.name+'.');return true;}
    if(!this.aligned){this.announce(this.v>=.3?'Stop the train before opening doors.':'Doors stay locked away from the platform. Press R to recover a missed stop.');return false;}
    if(side&&side!==this.station.side){this.announce('Safety interlock: the platform is on the '+this.station.side+'. Press D for platform doors.');return false;}
    this.doors=this.station.side;this.dwell=0;this.handle=0;this.announce('Doors open · '+this.station.name+'. Boarding passengers.');return true;
  }
  recover(){if(this.phase!=='service')return;const st=this.station;if(!st)return;this.s=st.at;this.v=0;this.handle=0;this.doors=st.side;this.dwell=0;this.score=Math.max(0,this.score-75);this.penalties++;this.announce('Recovered to '+st.name+'. Board passengers, then D to continue.');}
  step(dt,input={}){
    dt=clamp(Number.isFinite(dt)?dt:0,0,.1);if(this.phase!=='service')return;
    this.time+=dt;this.messageAge+=dt;this.prevS=this.s;
    if(this.doors){this.v=0;this.handle=0;this.dwell+=dt;if(this.assist&&this.dwell>5)this.toggleDoors();return;}
    const manual=input.power||input.brake||input.emergency;
    if(manual&&this.assist){this.assist=false;this.announce('Manual control. You have the handle.');}
    if(input.power)this.handle=clamp(this.handle+dt*.9,-1,1);
    if(input.brake)this.handle=clamp(this.handle-dt*1.5,-1,1);
    this.emergency=!!input.emergency;
    if(this.assist){const target=this.safeSpeed;this.handle=clamp((target-this.v)*.65,-1,1);if(this.aligned&&Math.abs(this.distance)<6)this.toggleDoors();}
    let accel=this.handle>0?this.handle*.9:this.handle*1.45;
    if(this.emergency){accel=-2.7;this.handle=-1;}
    accel-=.06+this.v*.002;
    this.v=clamp(this.v+accel*dt,0,26);this.s+=this.v*dt;
    if(this.station&&this.v<4&&this.distance>=-5&&this.distance<4&&this.handle<-.05){this.v=Math.max(0,this.v-dt*2);if(this.v<.6){this.s=this.station.at;this.v=0;this.handle=0;}}
    if(!this.signalCleared&&this.s>650&&this.s<=1028&&1020-this.s<8&&this.v<.4){this.signalHold+=dt;if(this.signalHold>6){this.signalCleared=true;this.announce('Signal clear. Proceed toward East River.');}}
    if(!this.signalCleared&&this.prevS<=1026&&this.s>1026){this.s=1020;this.v=0;this.handle=0;this.penalties++;this.score=Math.max(0,this.score-50);this.announce('Train protection stopped you at red. Wait for the signal.');}
    if(this.station&&this.distance< -22&&this.messageAge>4)this.announce('Missed platform. Slow down, then press R to recover to '+this.station.name+'.');
    if(this.assist&&this.aligned&&Math.abs(this.distance)<7)this.toggleDoors();
  }
  snapshot(){return {s:this.s,v:this.v,handle:this.handle,time:this.time,next:this.next,doors:this.doors,phase:this.phase,score:this.score,assist:this.assist,signal:this.signal,signalCleared:this.signalCleared,distance:this.distance,aligned:this.aligned,stops:this.stops,penalties:this.penalties};}
}
