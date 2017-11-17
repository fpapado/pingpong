import xs, { Listener, Producer } from 'xstream';

const orientationProducer: Producer<DeviceOrientationEvent> = {
  start: function(listener) {
    // Use (currently, Chrome-only) absolute orientation if available
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener(
        'deviceorientationabsolute',
        (ev: DeviceOrientationEvent) => {
          listener.next(ev);
        }
      );
    } else {
      // TODO: check if event is absolute or relative (Safari is absolute?)
      window.addEventListener(
        'deviceorientation',
        (ev: DeviceOrientationEvent) => {
          listener.next(ev);
        }
      );
    }
  },

  // TODO: implement this shit
  stop: function() {}
};

export const deviceOrientation$ = xs.createWithMemory(orientationProducer);
