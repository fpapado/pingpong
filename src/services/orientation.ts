import xs, { MemoryStream } from 'xstream';
import { position$ } from './position';
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
function onHeadingChange(event) {
  let heading = event.alpha;

  if (typeof event.webkitCompassHeading !== 'undefined') {
    heading = event.webkitCompassHeading; //iOS non-standard
  }

  let orientation = getBrowserOrientation();

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

    if (positionCurrent.hng === null) {
      positionCurrent.hng = heading + adjustment;
    }

    // TODO: calculate from given location instead of true north
    let phase =
      positionCurrent.hng < 0 ? 360 + positionCurrent.hng : positionCurrent.hng;

    // positionHng.textContent = ((360 - phase) | 0) + '°';
  } else {
    // device can't show heading
    showHeadingWarning();
  }
}

function showHeadingWarning() {
  if (!warningHeadingShown) {
    console.warn('Device cannot show heading');
    warningHeadingShown = true;
  }
}

function locationUpdate(position) {
  positionCurrent.lat = position.coords.latitude;
  positionCurrent.lng = position.coords.longitude;
}

function locationUpdateFail(error) {
  console.error('location fail: ', error);
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
  // next: locationUpdate,
  // error: locationUpdateFail,
  next: location => console.log(location),
  error: err => console.error(err),
  complete: () => {
    console.log('Watch stream is done');
  }
};

// our current position
let positionCurrent = {
  lat: 0,
  lng: 0,
  hng: 0
};

export type HeadingResult = Either<HeadingSuccess, HeadingError>;
export type HeadingSuccess = number | 'NOT_MOVING';
export type HeadingError = 'UNAVAILABLE';

export const orientation$: MemoryStream<HeadingResult> = position$
  .debug()
  .map(position => {
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

// window.addEventListener('deviceorientation', onHeadingChange);
// const hng$ = () => {};

// export const position$ = xs
// .combine(latlng$, hng$)
// .map(([latlng, hng]) => ({ ...latlng, hng }));
