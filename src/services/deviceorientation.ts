import xs, { MemoryStream, Listener, Producer } from 'xstream';
import { Either } from '@typed/either';

const orientationProducer: Producer<DeviceOrientationEvent> = {
  start: function(listener) {
    // Use (currently, Chrome-only) absolute orientation if available
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', (ev: DeviceOrientationEvent) => {
        listener.next(ev);
      });
    } else {
      // TODO: check if event is absolute or relative (Safari is absolute?)
      window.addEventListener('deviceorientation', (ev: DeviceOrientationEvent) => {
        listener.next(ev);
      });
    }
  },

  // TODO: implement this shit
  stop: function() {}
};

export const deviceOrientation$ = xs.createWithMemory(orientationProducer);

export type AbsoluteOrientationResult = Either<number, 'ABSOLUTE_ORIENTATION_UNAVAILABLE'>;
export const absoluteOrientation$: MemoryStream<AbsoluteOrientationResult> = deviceOrientation$.map(
  ev => {
    if (ev.absolute) {
      if (ev.alpha === null) {
        return Either.of('ABSOLUTE_ORIENTATION_UNAVAILABLE' as 'ABSOLUTE_ORIENTATION_UNAVAILABLE');
      }
      return Either.left(ev.alpha);
    } else if (typeof ev['webkitCompassHeading'] !== 'undefined') {
      return Either.left(ev['webkitCompassHeading'] as number); //iOS non-standard
    } else {
      return Either.of('ABSOLUTE_ORIENTATION_UNAVAILABLE' as 'ABSOLUTE_ORIENTATION_UNAVAILABLE');
    }
  }
);
