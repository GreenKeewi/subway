// Keep the simulation on wall-clock time down to two rendered frames/second.
// Longer stalls are bounded so returning from a suspended tab cannot fast-forward a trip.
export const FIXED_STEP=1/60;
export const MAX_FRAME_SECONDS=.5;
export const MAX_STEPS_PER_FRAME=30;
export function fixedFrame(sim,elapsed,accumulator=0,input={}){
  const elapsedSeconds=Number.isFinite(elapsed)?Math.max(0,Math.min(elapsed,MAX_FRAME_SECONDS)):0;
  accumulator+=elapsedSeconds;
  let steps=0;
  while(accumulator+1e-10>=FIXED_STEP&&steps<MAX_STEPS_PER_FRAME){sim.step(FIXED_STEP,input);accumulator-=FIXED_STEP;steps++;}
  return {accumulator:Math.max(0,Math.min(accumulator,FIXED_STEP)),steps,elapsedSeconds};
}
