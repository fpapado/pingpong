import xs from 'xstream';
import { position$ } from './position';

//set to true for debugging output
let debug = false;

// our current position
let positionCurrent = {
  lat: null,
  lng: null,
  hng: null
};

// if we have shown the heading unavailable warning yet
let warningHeadingShown = false;

// switches keeping track of our current app state
let isOrientationLockable = false;
let isOrientationLocked = false;
let isNightMode = false;

// the orientation of the device on app load
let defaultOrientation;

// browser agnostic orientation
function getBrowserOrientation() {
  let orientation;
  if (screen.orientation && screen.orientation.type) {
    orientation = screen.orientation.type;
  } else {
    orientation =
      screen.orientation || screen.mozOrientation || screen.msOrientation;
  }

  /*
        'portait-primary':      for (screen width < screen height, e.g. phone, phablet, small tablet)
                                  device is in 'normal' orientation
                                for (screen width > screen height, e.g. large tablet, laptop)
                                  device has been turned 90deg clockwise from normal
        'portait-secondary':    for (screen width < screen height)
                                  device has been turned 180deg from normal
                                for (screen width > screen height)
                                  device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
        'landscape-primary':    for (screen width < screen height)
                                  device has been turned 90deg clockwise from normal
                                for (screen width > screen height)
                                  device is in 'normal' orientation
        'landscape-secondary':  for (screen width < screen height)
                                  device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
                                for (screen width > screen height)
                                  device has been turned 180deg from normal
      */

  return orientation;
}

// browser agnostic orientation unlock
function browserUnlockOrientation() {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  } else if (screen.unlockOrientation) {
    screen.unlockOrientation();
  } else if (screen.mozUnlockOrientation) {
    screen.mozUnlockOrientation();
  } else if (screen.msUnlockOrientation) {
    screen.msUnlockOrientation();
  }
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

    positionCurrent.hng = heading + adjustment;

    let phase =
      positionCurrent.hng < 0 ? 360 + positionCurrent.hng : positionCurrent.hng;

    // positionHng.textContent = ((360 - phase) | 0) + '°';

    // apply rotation to compass rose
    // TODO: pass positionCurrent.hng to compass
    // TODO: calculate from given location instead of true north
    if (typeof rose.style.transform !== 'undefined') {
      rose.style.transform = 'rotateZ(' + positionCurrent.hng + 'deg)';
    } else if (typeof rose.style.webkitTransform !== 'undefined') {
      rose.style.webkitTransform = 'rotateZ(' + positionCurrent.hng + 'deg)';
    }
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
  positionLat.textContent = 'n/a';
  positionLng.textContent = 'n/a';
  console.log('location fail: ', error);
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

export const orientation$ = position$.map(({ coords }) => {
  // TODO: errors as appropriate
  if (isNaN(coords.heading)) {
    return 0;
  } else if (coords.heading === null) {
    return 0;
  } else {
    return coords.heading;
  }
});

// window.addEventListener('deviceorientation', onHeadingChange);
// const hng$ = () => {};

// export const position$ = xs
// .combine(latlng$, hng$)
// .map(([latlng, hng]) => ({ ...latlng, hng }));
