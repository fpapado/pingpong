import xs, { Listener, Producer } from 'xstream';

interface OrientationProducer extends Producer<DeviceOrientationEvent> {
  watchId: number;
}
// window.addEventListener('deviceorientation', onHeadingChange);

const orientationProducer: OrientationProducer = {
  start: function(listener) {
    window.addEventListener('deviceorientation', ev => listener.next(ev));
  },

  // TODO: implement this shit
  stop: function() {},

  watchId: 0
};

export const deviceOrientation$ = xs.createWithMemory(orientationProducer);
