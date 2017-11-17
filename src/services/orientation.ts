import xs, { MemoryStream } from 'xstream';
import throttle from 'xstream/extra/throttle';
import { position$ } from './position';
import { deviceOrientation$ } from './deviceorientation';
import bearing from '@turf/bearing';
import distance from '@turf/distance';
import { Either } from '@typed/either';

// if we have shown the heading unavailable warning yet
let warningHeadingShown = false;

// switches keeping track of our current app state
let isOrientationLockable = false;
let isOrientationLocked = false;
let isNightMode = false;

// the orientation of the device on app load
let defaultOrientation;

// browser agnostic orientation
function getBrowserOrientation(): OrientationType {
  // TODO: add defs such that || screen.mozOrientation
  let orientation = screen.orientation || screen.msOrientation;

  return orientation.type;
}

// called on device orientation change
// TODO: change this to a result type
function onHeadingChange(event: DeviceOrientationEvent): number {
  if (event.alpha === null) {
    return 0;
  }

  let heading = event.alpha;

  // if (typeof event.webkitCompassHeading !== 'undefined') {
  //   heading = event.webkitCompassHeading; //iOS non-standard
  // }

  let orientation = getBrowserOrientation();
  console.log(orientation);

  if (typeof heading !== 'undefined' && heading !== null) {
    // && typeof orientation !== "undefined") {
    // we have a browser that reports device heading and orientation

    // what adjustment we have to add to rotation to allow for current device orientation
    let adjustment = 0;
    if (defaultOrientation === 'landscape') {
      adjustment -= 90;
    }

    if (typeof orientation !== 'undefined') {
      let currentOrientation = orientation.split('-');

      if (defaultOrientation !== currentOrientation[0]) {
        if (defaultOrientation === 'landscape') {
          adjustment -= 270;
        } else {
          adjustment -= 90;
        }
      }

      if (currentOrientation[1] === 'secondary') {
        adjustment -= 180;
      }
    }

    // Finally, subtract heading from 360, to get compass heading
    heading = 360 - (heading + adjustment);
    return heading;
  } else {
    // TODO: stream response
    // device can't show heading
    showHeadingWarning();
    return 0;
  }
}

function showHeadingWarning() {
  if (!warningHeadingShown) {
    console.warn('Device cannot show heading');
    warningHeadingShown = true;
  }
}

function decimalToSexagesimal(decimal, type) {
  let degrees = decimal | 0;
  let fraction = Math.abs(decimal - degrees);
  let minutes = (fraction * 60) | 0;
  let seconds = (fraction * 3600 - minutes * 60) | 0;

  let direction = '';
  let positive = degrees > 0;
  degrees = Math.abs(degrees);
  switch (type) {
    case 'lat':
      direction = positive ? 'N' : 'S';
      break;
    case 'lng':
      direction = positive ? 'E' : 'W';
      break;
  }

  return degrees + '° ' + minutes + "' " + seconds + '" ' + direction;
}

if (typeof screen !== 'undefined') {
  if (screen.width > screen.height) {
    defaultOrientation = 'landscape';
  } else {
    defaultOrientation = 'portrait';
  }
}

const positionLogger = {
  next: location => console.log(location),
  error: err => console.error(err),
  complete: () => {
    console.log('Watch stream is done');
  }
};

export type HeadingResult = Either<HeadingSuccess, HeadingError>;
export type HeadingSuccess = number | 'NOT_MOVING';
export type HeadingError = 'UNAVAILABLE';

export const headingFromPosition$: MemoryStream<
  HeadingResult
> = position$.debug().map(position => {
  let { coords } = position;
  if (coords.heading === null) {
    return Either.of('UNAVAILABLE' as 'UNAVAILABLE');
  } else {
    let res: number | 'NOT_MOVING';
    if (isNaN(coords.heading)) {
      return Either.left('NOT_MOVING' as 'NOT_MOVING');
    } else {
      return Either.left(coords.heading);
    }
  }
});

export const headingFromOrientation$ = deviceOrientation$
  .compose(throttle(100))
  .debug()
  .map(onHeadingChange);

type LatLng = [number, number];

export type AimResult = Either<number, 'ALPHA_NOT_AVAILABLE'>;

const aimToTarget = (
  target: LatLng,
  position: Position,
  orientation: DeviceOrientationEvent
): AimResult => {
  let distanceToTarget = distance(
    [position.coords.latitude, position.coords.longitude],
    target,
    { units: 'kilometers' }
  );

  let bearingToTarget = bearing(
    [position.coords.latitude, position.coords.longitude],
    target
  );

  if (!orientation.alpha) {
    return Either.of('ALPHA_NOT_AVAILABLE' as 'ALPHA_NOT_AVAILABLE');
  }
  let aim = bearingToTarget + orientation.alpha;

  return Either.left(aim);
};

export const makeCustomAim$ = (target: LatLng) =>
  xs
    .combine(position$, deviceOrientation$.compose(throttle(100)))
    .map(([position, orientation]) =>
      aimToTarget(target, position, orientation)
    );
