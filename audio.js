// Original synthesized traction, rail and pneumatic sounds. Every source uses master.
export class SubwayAudio {
  constructor(){
    const AudioContext=window.AudioContext||window.webkitAudioContext;this.ac=new AudioContext();const ac=this.ac;
    this.master=ac.createGain();this.master.gain.value=0;this.master.connect(ac.destination);
    this.motor=ac.createOscillator();this.motor.type='sawtooth';this.motorGain=ac.createGain();this.motorGain.gain.value=0;this.motorFilter=ac.createBiquadFilter();this.motorFilter.type='lowpass';this.motorFilter.frequency.value=500;this.motor.connect(this.motorFilter);this.motorFilter.connect(this.motorGain);this.motorGain.connect(this.master);this.motor.start();
    this.rumble=ac.createOscillator();this.rumble.type='triangle';this.rumbleGain=ac.createGain();this.rumbleGain.gain.value=0;this.rumble.connect(this.rumbleGain);this.rumbleGain.connect(this.master);this.rumble.start();
    const buffer=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),data=buffer.getChannelData(0);let seed=617;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296)*2-1;}this.noiseBuffer=buffer;
    const noise=ac.createBufferSource();noise.buffer=buffer;noise.loop=true;this.airFilter=ac.createBiquadFilter();this.airFilter.type='lowpass';this.airFilter.frequency.value=850;this.airGain=ac.createGain();this.airGain.gain.value=0;noise.connect(this.airFilter);this.airFilter.connect(this.airGain);this.airGain.connect(this.master);noise.start();
    this.brakeFilter=ac.createBiquadFilter();this.brakeFilter.type='bandpass';this.brakeFilter.frequency.value=2100;this.brakeFilter.Q.value=.7;this.brakeGain=ac.createGain();this.brakeGain.gain.value=0;noise.connect(this.brakeFilter);this.brakeFilter.connect(this.brakeGain);this.brakeGain.connect(this.master);
    this.voices=new Set();this.lastJoint=-1;this.lastDoor=undefined;this.lastSignalCount=0;
  }
  silence(){const t=this.ac.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(0,t,.012);}
  resume(){if(this.ac.state==='suspended')this.ac.resume().catch(()=>{});}
  tone(frequency,when,duration=.2,volume=.05){const ac=this.ac,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=frequency;o.connect(g);g.connect(this.master);g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(volume,when+.012);g.gain.exponentialRampToValueAtTime(.0001,when+duration);this.voices.add(o);o.onended=()=>{o.disconnect();g.disconnect();this.voices.delete(o);};o.start(when);o.stop(when+duration+.02);}
  chime(closing=true){const t=this.ac.currentTime;this.tone(closing?880:660,t,.35,.055);this.tone(closing?660:880,t+.24,.4,.045);}
  railJoint(speed){const ac=this.ac,t=ac.currentTime;for(const delay of [0,.105]){const source=ac.createBufferSource(),g=ac.createGain(),filter=ac.createBiquadFilter();source.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=450+speed*18;source.connect(filter);filter.connect(g);g.connect(this.master);g.gain.setValueAtTime(.014+speed*.0009,t+delay);g.gain.exponentialRampToValueAtTime(.0001,t+delay+.09);this.voices.add(source);source.onended=()=>{source.disconnect();filter.disconnect();g.disconnect();this.voices.delete(source);};source.start(t+delay);source.stop(t+delay+.1);}}
  update(sim,active,muted){const ac=this.ac,t=ac.currentTime;this.master.gain.setTargetAtTime(active&&!muted?1:0,t,.055);
    const moving=sim.v/26;this.motorGain.gain.setTargetAtTime(.004+moving*.019+Math.max(0,sim.handle)*.004,t,.12);this.motor.frequency.setTargetAtTime(36+sim.v*6.4+Math.max(0,sim.handle)*6,t,.1);this.rumble.frequency.setTargetAtTime(24+sim.v*.8,t,.1);this.rumbleGain.gain.setTargetAtTime(.005+moving*.014,t,.12);this.airGain.gain.setTargetAtTime(moving*moving*.035,t,.12);this.brakeGain.gain.setTargetAtTime(sim.v>1?Math.max(0,-sim.handle)*.007:0,t,.1);
    if(active&&!muted){const joint=Math.floor(sim.s/13);if(joint!==this.lastJoint&&sim.v>3)this.railJoint(sim.v);if(this.lastDoor!==undefined&&this.lastDoor!==sim.doors)this.chime(!sim.doors);if(sim.signalStates.filter(s=>s.cleared).length>this.lastSignalCount)this.tone(620,t,.3,.035);}
    this.lastJoint=Math.floor(sim.s/13);this.lastDoor=sim.doors;this.lastSignalCount=sim.signalStates.filter(s=>s.cleared).length;
  }
  get diagnostics(){return {state:this.ac.state,masterGain:this.master.gain.value,allSourcesUseMaster:true,liveOneShots:this.voices.size};}
}
