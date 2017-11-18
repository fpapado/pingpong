# Pingpong
Pingpong is my playground for trying out web APIs. You might find something interesting here :)

Currently playing with:
- The DeviceOrientation and Geolocation APIs

Next on the list:
- Push and Notification APIs

## Notes
### Absolute Orientation
I used `DeviceOrientation` in order to make a compass, with both an absolute and a custom bearing.

Getting absolute orientation (i.e. to the north pole) turned out to be a bit of a pain.
Despite what `DeviceOrientationEvent` specifies, `DeviceOrientationEvent.absolute` was never `true` in my tests (Chrome, Firefox).

As of version 50, Chrome uses a new `deviceorientationabsolute` event, to get absolute orientation.
This is because of VR/AR needs for relative orientation in `deviceorientation`.
This seems to be in the specification now, but Firefox does not have it.

Safari (Webkit), has its own property for compass heading, `DeviceOrientationEvent.webkitCompassHeading`.
I do not have a device to play with this, but if you have any suggestsions, I will happily take PRs!

To get the absolute orientation, I would thus suggest:
```typescript
// Check if Chrome post-v50 event is available
if ('ondeviceorientationabsolute' in window) {
  window.addEventListener(
    'deviceorientationabsolute',
    (ev: DeviceOrientationEvent) => {
      // do something with ev here
    }
  );
} else {
  window.addEventListener(
    'deviceorientation',
    (ev: DeviceOrientationEvent) => {
      // Check if Webkit-specific property
      if (ev.webkitCompassHeading) {
        // do something with ev here
        // NOTE: might have to normalise values
        // I have not tested this, as I don't have Safari
      } else if (ev.absolute) {
        // do something with ev here
      // Usually Firefox gets here
      } else {
        // We don't have easy absolute values
        // Choose to error, cry, or figure them out via movement
      }
    }
  );
```

### `Coordinates.heading`
Another thought I had was using `Coordinates.heading` to get the orientation, and adjust form there.

It is described as:
"
The Coordinates.heading read-only property is a double representing the direction in which the device is traveling. This value, specified in degrees, indicates how far off from heading due north the device is. Zero degrees represents true true north, and the direction is determined clockwise (which means that east is 90 degrees and west is 270 degrees). If Coordinates.speed is 0, heading is NaN. If the device is not able to provide heading information, this value is null.
"

Despite the "Browser Compatibility" in mdn indicating that Chrome and Firefox on mobile support it, I could not get values other than `null` and `NaN` out of it, but maybe I was not moving sufficiently.

In either case, I would prefer using an absolute `DeviceOrientation`, before resorting to `Coordinates.heading`, as it doesn't require (possibly more power-hungry) Geolocation.

### Manual Heading
**NOTE: Unsure of this**

I recon you could calculate heading manually with just Geolocation:
- Calculate the `Coordinates.latitude, Coordinate.longitude` bearing to True North (0, 90)
- Instruct the user to move (much like Geolocation.heading)
- Calculate the difference between the previous and current position with respect to the bearing

#### Resources:

DeviceOrientation:
- https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
- https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained

Chrome changes to DeviceOrientation in v50:
- https://developers.google.com/web/updates/2016/03/device-orientation-changes

Spec:
- https://w3c.github.io/deviceorientation/spec-source-orientation.html#deviceorientationabsolute

Coordinates Heading:
- https://developer.mozilla.org/en-US/docs/Web/API/Coordinates/heading
- https://dev.w3.org/geo/api/spec-source.html#heading

### Streams
**WIP**

I found wrapping these APIs in streams to be particularly pleasant both for further use and calculating derived, normalised state.

## CLI Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# test the production build locally
npm run serve
```

For detailed explanation on how things work, checkout the [Preact CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).
