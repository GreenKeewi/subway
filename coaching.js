import {clamp,speedLimit,nextSpeedZone} from './sim.js?v=world2-1016';
export function formatClock(seconds){const n=Math.max(0,Math.floor(seconds));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function drivingGuide(sim){
  const stop=sim.station,limit=speedLimit(sim.s),signal=sim.nextSignal,signalAhead=!!signal&&signal.distance<400;
  const signalDistance=signal?.distance??Infinity,stationDistance=sim.distance;
  const targetIsSignal=signalAhead&&signalDistance>=-8&&signalDistance<stationDistance;
  const distance=targetIsSignal?signalDistance:stationDistance;
  const brakingDistance=sim.v*sim.v/(2*1.4)+sim.v*.8+6;
  const zone=nextSpeedZone(sim.s),zoneDistance=zone?zone.at-sim.s:Infinity,zoneTarget=zone?Math.sqrt(zone.limit*zone.limit+1.35*Math.max(0,zoneDistance-20)):Infinity;
  const targetSpeed=Math.min(limit,zoneTarget,Math.sqrt(Math.max(0,distance<60?distance-1.5:distance-sim.v*.8-9)*(distance<60?1.35:2.3)));
  let title='NEXT STOP',text='Hold Up to add power. Z coasts; Down moves the handle into brake.',action='CRUISE';
  if(sim.doors){title=`BOARDING · ${sim.doors.toUpperCase()} SIDE`;text=sim.dwell<4?`Passengers boarding · ${Math.ceil(4-sim.dwell)}s. Doors lock the train safely.`:'Ready to depart. Press D to close the platform doors.';action=sim.dwell<4?'BOARDING':'READY';}
  else if(targetIsSignal&&sim.v<.4&&Math.abs(signalDistance)<18){title='WAITING FOR SIGNAL';text=`Hold here. The route clears in ${Math.max(1,Math.ceil((signal?sim.signals[signal.index].hold:6)-(signal?.index!=null?sim.signalStates[signal.index].hold:0)))}s.`;action='WAIT';}
  else if(sim.aligned){title='AT PLATFORM';text=stationDistance>3?`Doors ready · ${Math.round(stationDistance)}m short. D boards now; a touch of power creeps to the orange marker for perfect.`:`Good alignment · ${Math.round(Math.abs(stationDistance))}m ${stationDistance<0?'past':'short'}. D opens the ${stop.side} doors.`;action='OPEN DOORS';}
  else if(stationDistance< -19){title='MISSED PLATFORM';text='No rush. Brake to a stop, then R recovers to the platform.';action='RECOVER';}
  else if(distance<brakingDistance+18&&sim.v>2&&sim.v>targetSpeed+.3){title=targetIsSignal?'RED SIGNAL AHEAD':'BRAKING ZONE';text=`Hold Down to add brake; release holds the setting. Aim for ${targetIsSignal?'the signal stop':'the orange marker'} · ${Math.max(0,Math.round(distance))}m.`;action='BRAKE';}
  else if(distance<45){title=targetIsSignal?'SIGNAL APPROACH':'PLATFORM APPROACH';text=targetIsSignal?(sim.v<.5?`Signal stop line ${Math.round(distance)}m ahead. Creep forward; stop within 18m.`:'Ease the brake. Stop before the signal line.'):sim.v<.5?'A little power moves you closer. D opens once aligned.':'Feather Down, then release to hold the brake setting. Aim for the orange marker.';action='EASE IN';}
  else if(zone&&zoneDistance<Math.max(180,Math.max(0,(sim.v*sim.v-zone.limit*zone.limit)/2.4)+sim.v*.8+45)&&sim.v>zone.limit-.3){title='LOWER LIMIT AHEAD';text=`${Math.round(zone.limit*2.23694)} mph in ${Math.round(zoneDistance)}m. Ease Down now; release holds your brake setting.`;action='SLOW';}
  else if(sim.v>limit+.8){title='EASE THE SPEED';text=`Line limit ${Math.round(limit*2.23694)} mph. Hold Down to reduce power and brake.`;action='SLOW';}
  else if(sim.handle>0&&sim.v>limit-1){text='Near line speed. Press Z to coast, then use a little power as needed.';action='COAST';}
  if(sim.assist){text=sim.doors?text:`Assist is ${action==='BRAKE'?'braking':action==='WAIT'?'waiting':action==='EASE IN'?'lining up':'driving'}. Any driving key gives you control.`;}
  const due=stop?.due||0,delta=sim.time-due;
  return {title,text,action,upcomingLimit:zone?.limit??null,zoneDistance,brakingDistance,targetSpeed,signalAhead,signalDistance,distance,targetIsSignal,
    schedule:sim.doors?sim.dwell<4?`Boarding ${Math.ceil(4-sim.dwell)}s`:'Ready · D to close':stop?`Due ${formatClock(due)} · ${Math.abs(delta)<10?'on time':delta<0?`${Math.round(-delta)}s early`:`${Math.round(delta)}s late`}`:'Service complete'};
}
export function serviceGrade(sim){const stops=sim.stops,perfect=stops.filter(s=>Math.abs(s.error)<=3).length,comfort=stops.length?Math.round(stops.reduce((n,s)=>n+(s.comfort??100),0)/stops.length):100;const rating=sim.penalties===0&&perfect>=Math.ceil(sim.stations.length*.8)&&comfort>=85?'Gold service':sim.penalties<2&&perfect>=Math.ceil(sim.stations.length*.4)?'Silver service':'Service complete';return {perfect,comfort,rating};}
