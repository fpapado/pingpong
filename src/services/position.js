import xs from 'xstream';

const positionProducer = {
  start: listener => {
    this.watchId = navigator.geolocation.watchPosition(
      pos => listener.next(pos),
      err => listener.error(err),
      {
        enableHighAccuracy: false,
        maximumAge: 1000
      }
    );
  },

  stop: () => {
    navigator.geolocation.clearWatch(this.watchId);
  },

  watchId: 0
};

export const position$ = xs.createWithMemory(positionProducer);
