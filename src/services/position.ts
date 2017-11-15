import xs, { Listener, Producer } from 'xstream';

interface PositionProducer extends Producer<Position> {
  watchId: number;
}

const positionProducer: PositionProducer = {
  start: function(listener) {
    this.watchId = navigator.geolocation.watchPosition(
      pos => listener.next(pos),
      err => listener.error(err),
      {
        enableHighAccuracy: false,
        maximumAge: 1000
      }
    );
  },

  stop: function() {
    navigator.geolocation.clearWatch(this.watchId);
  },

  watchId: 0
};

export const position$ = xs.createWithMemory(positionProducer);
