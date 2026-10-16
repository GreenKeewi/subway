export const STATIONS = [
  {name:'Canal Street',short:'Canal',at:0,side:'right',due:0,zone:'underground'},
  {name:'Bowery',short:'Bowery',at:640,side:'left',due:85,zone:'underground'},
  {name:'East River',short:'East River',at:1310,side:'right',due:173,zone:'elevated'},
  {name:'Grand Avenue',short:'Grand',at:2100,side:'left',due:275,zone:'elevated'},
  {name:'Queens Terminal',short:'Queens',at:2800,side:'right',due:370,zone:'elevated'}
];
export const FULL_STATIONS = [...STATIONS,
  {name:'Museum Row',short:'Museum',at:3550,side:'left',due:450,zone:'underground'},
  {name:'Jackson Square',short:'Jackson',at:4450,side:'right',due:550,zone:'underground'},
  {name:'Woodside Yard',short:'Woodside',at:5350,side:'left',due:650,zone:'yard'},
  {name:'Meadows Park',short:'Meadows',at:6200,side:'right',due:740,zone:'park'},
  {name:'Astoria Quay',short:'Astoria',at:7100,side:'left',due:840,zone:'waterfront'}
];
export const ROUTES={quick:{name:'Quick Local',destination:'Queens Terminal',stations:STATIONS,length:2800},full:{name:'Full Borough Line',destination:'Astoria Quay',stations:FULL_STATIONS,length:7100}};
export const SIGNALS=[{at:1020,hold:6},{at:3970,hold:5},{at:5780,hold:5}];
export const WORLD_END=7350;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const SPEED_ZONES=[{at:0,limit:19},{at:760,limit:15},{at:1090,limit:18},{at:1540,limit:22},{at:2280,limit:18},{at:3300,limit:16},{at:4750,limit:18},{at:5750,limit:22},{at:6550,limit:17}];
export function speedLimit(s){return SPEED_ZONES.findLast(zone=>s>=zone.at)?.limit||19;}
export function nextSpeedZone(s){const current=speedLimit(s);return SPEED_ZONES.find(zone=>zone.at>s&&zone.limit<current)||null;}
const eased=(from,to,t)=>from+(to-from)*(1-Math.cos(clamp(t,0,1)*Math.PI))/2;
export function trackPoint(s){const y=s<820?0:s<1160?eased(0,20,(s-820)/340):s<3000?20:s<3420?eased(20,0,(s-3000)/420):s<4700?0:s<5100?eased(0,8,(s-4700)/400):8;return {x:90*Math.sin(s/700)+.035*s,y,z:-s};}
export class SubwaySim {
  constructor(route='quick'){this.reset(route);}
  reset(route=this.route||'quick'){
    this.route=ROUTES[route]?route:'quick';this.stations=ROUTES[this.route].stations;this.signals=SIGNALS.filter(s=>s.at<this.stations.at(-1).at);this.signalStates=this.signals.map(()=>({cleared:false,hold:0}));
    Object.assign(this,{s:0,v:0,handle:0,time:0,next:0,doors:'right',dwell:0,phase:'service',score:0,stops:[],assist:false,emergency:false,penalties:0,message:'Welcome aboard. Let passengers board, then close the right doors with D.',messageAge:0,prevS:0,segmentOverspeed:0,segmentHarsh:0,totalOverspeed:0,totalHarsh:0,usedAssist:false});
  }
  // Compatibility aliases for the original first signal and existing QA hooks.
  get signalCleared(){return this.signalStates[0]?.cleared||false;}
  set signalCleared(value){if(this.signalStates[0])this.signalStates[0].cleared=!!value;}
  get signalHold(){return this.signalStates[0]?.hold||0;}
  set signalHold(value){if(this.signalStates[0])this.signalStates[0].hold=value;}
  announce(text){this.message=text;this.messageAge=0;}
  get station(){return this.stations[this.next]||null;}
  get distance(){return this.station?this.station.at-this.s:0;}
  get aligned(){return !!this.station&&Math.abs(this.distance)<19&&this.v<.3;}
  get nextSignal(){const i=this.signals.findIndex((signal,i)=>!this.signalStates[i].cleared&&signal.at>=this.s-8);return i<0?null:{...this.signals[i],...this.signalStates[i],index:i,distance:this.signals[i].at-this.s};}
  get signal(){return this.nextSignal&&this.nextSignal.distance<330?'red':'green';}
  get safeSpeed(){let limit=speedLimit(this.s);if(this.station&&this.distance>0)limit=Math.min(limit,Math.sqrt(Math.max(0,this.distance-3)*1.5));const zone=nextSpeedZone(this.s);if(zone)limit=Math.min(limit,Math.sqrt(zone.limit*zone.limit+1.35*Math.max(0,zone.at-this.s-20)));const signal=this.nextSignal;if(signal&&signal.distance<370)limit=Math.min(limit,Math.sqrt(Math.max(0,signal.distance)*1.45));return limit;}
  toggleDoors(side){
    if(this.phase!=='service')return false;
    if(this.doors){
      if(this.dwell<4){this.announce('Boarding passengers · wait '+Math.ceil(4-this.dwell)+' seconds.');return false;}
      const stop=this.station;this.doors=null;this.handle=0;this.stops.push({name:stop.name,error:Math.round(this.s-stop.at),time:this.time,comfort:Math.round(clamp(100-this.segmentHarsh*4-this.segmentOverspeed*2,0,100)),assisted:this.usedAssist});this.segmentOverspeed=0;this.segmentHarsh=0;
      this.score+=Math.max(50,150-Math.round(Math.abs(this.s-stop.at)*3));this.next++;
      if(!this.station){this.phase='complete';this.announce('End of the line. All passengers delivered.');}else this.announce('Doors locked. Next stop: '+this.station.name+'.');return true;
    }
    if(!this.aligned){this.announce(this.v>=.3?'Stop the train before opening doors.':'Doors stay locked away from the platform. Press R to recover a missed stop.');return false;}
    if(side&&side!==this.station.side){this.announce('Safety interlock: the platform is on the '+this.station.side+'. Press D for platform doors.');return false;}
    this.doors=this.station.side;this.dwell=0;this.handle=0;this.announce('Doors open · '+this.station.name+'. Boarding passengers.');return true;
  }
  recover(){if(this.phase!=='service')return;const st=this.station;if(!st)return;this.s=st.at;this.v=0;this.handle=0;this.doors=st.side;this.dwell=0;this.score=Math.max(0,this.score-75);this.penalties++;this.announce('Recovered to '+st.name+'. Board passengers, then D to continue.');}
  step(dt,input={}){
    dt=clamp(Number.isFinite(dt)?dt:0,0,.1);if(this.phase!=='service')return;
    this.time+=dt;this.messageAge+=dt;this.prevS=this.s;
    const manual=input.power||input.brake||input.emergency||input.coast;
    if(manual&&this.assist){this.assist=false;this.announce('Manual control. You have the handle.');}
    if(this.assist)this.usedAssist=true;
    if(this.doors){this.v=0;this.handle=0;this.dwell+=dt;if(this.assist&&this.dwell>5)this.toggleDoors();return;}
    if(input.power)this.handle=clamp(this.handle+dt*.9,-1,1);
    if(input.coast)this.handle=0;
    if(input.brake)this.handle=clamp(this.handle-dt*1.5,-1,1);
    this.emergency=!!input.emergency;
    if(this.assist){this.handle=clamp((this.safeSpeed-this.v)*.65,-1,1);if(this.aligned&&Math.abs(this.distance)<6)this.toggleDoors();}
    let accel=this.handle>0?this.handle*.9:this.handle*1.45;
    if(this.emergency){accel=-2.7;this.handle=-1;}
    accel-=.06+this.v*.002;
    if(this.v>speedLimit(this.s)+1){this.segmentOverspeed+=dt;this.totalOverspeed+=dt;}
    if(this.v>1&&this.emergency){this.segmentHarsh+=dt;this.totalHarsh+=dt;}
    this.v=clamp(this.v+accel*dt,0,26);this.s+=this.v*dt;
    if(this.station&&this.v<4&&this.distance>=-5&&this.distance<4&&this.handle<-.05){this.v=Math.max(0,this.v-dt*2);if(this.v<.6){this.s=this.station.at;this.v=0;this.handle=0;}}
    this.signals.forEach((signal,index)=>{const state=this.signalStates[index];if(state.cleared)return;
      if(Math.abs(signal.at-this.s)<18&&this.v<.4){state.hold+=dt;if(state.hold>signal.hold){state.cleared=true;this.announce('Signal clear. Proceed toward '+(this.station?.name||'the terminus')+'.');}}
      if(!state.cleared&&this.prevS<=signal.at+6&&this.s>signal.at+6){this.s=signal.at;this.v=0;this.handle=0;this.penalties++;this.score=Math.max(0,this.score-50);this.announce('Train protection stopped you at red. Wait for the signal.');}
    });
    if(this.station&&this.distance< -22&&this.messageAge>4)this.announce('Missed platform. Slow down, then press R to recover to '+this.station.name+'.');
    if(this.assist&&this.aligned&&Math.abs(this.distance)<7)this.toggleDoors();
  }
  snapshot(){return {route:this.route,stationCount:this.stations.length,s:this.s,v:this.v,handle:this.handle,time:this.time,next:this.next,doors:this.doors,phase:this.phase,score:this.score,assist:this.assist,signal:this.signal,signalCleared:this.signalCleared,nextSignal:this.nextSignal,signals:this.signalStates.map(s=>({...s})),distance:this.distance,aligned:this.aligned,stops:this.stops,penalties:this.penalties,totalOverspeed:this.totalOverspeed,totalHarsh:this.totalHarsh,usedAssist:this.usedAssist};}
}
