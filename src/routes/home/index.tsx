import { Listener } from 'xstream';
import { h, Component } from 'preact';
import {
  HeadingResult,
  headingFromPosition$,
  headingFromOrientation$,
  AimResult,
  makeCustomAim$
} from '../../services/orientation';
import { Compass } from '../../components/Compass';
import { unpack } from '@typed/either';
import { MemoryStream } from 'xstream';

interface HomeProps {}
interface NormalState {
  state: 'NORMAL';
  heading: number;
  distance?: number;
  infoText?: string;
}
interface ErrorState {
  state: 'ERROR';
  errorText: string;
}
type HomeState = NormalState | ErrorState;

// Use if you want to use heading (doesn't seem to work tbh)
// const state$: MemoryStream<HomeState> = headingFromPosition$
//   .debug()
//   .map(result => stateFromHeading(result))
//   .startWith({ state: 'NORMAL', heading: 0 });

// Use if you want (best-effort) true north
// const state$: MemoryStream<HomeState> = headingFromOrientation$
//   .debug()
//   .map(heading => {
//     return { state: 'NORMAL' as 'NORMAL', heading: heading };
//   })
//   .startWith({ state: 'NORMAL', heading: 0 });

const PORTO: [number, number] = [41.1579, -8.6291];
const state$: MemoryStream<HomeState> = makeCustomAim$(PORTO)
  .debug()
  .map(result => stateFromAim(result))
  .startWith({ state: 'NORMAL', heading: 0 });

const stateFromAim = (aimResult: AimResult): HomeState => {
  return unpack(
    (value): HomeState => ({
      state: 'NORMAL',
      heading: value
    }),
    (err): HomeState => ({
      state: 'ERROR',
      errorText: 'Device orientation is not available'
    }),
    aimResult
  );
};

const stateFromHeading = (result: HeadingResult): HomeState => {
  return unpack(
    (value): HomeState => {
      if (value === 'NOT_MOVING') {
        return {
          state: 'NORMAL',
          heading: 0,
          infoText:
            'We cannot find your position without moving a bit. Please move :)'
        };
      } else {
        return { state: 'NORMAL', heading: value };
      }
    },
    (error): HomeState => {
      switch (error) {
        case 'UNAVAILABLE':
          return {
            state: 'ERROR',
            errorText: 'Your device does not support detecting heading'
          };
      }
    },
    result
  );
};

export default class Home extends Component<HomeProps, HomeState> {
  stateListener: Listener<HomeState>;

  constructor() {
    super();

    this.stateListener = {
      next: state => {
        this.setState(state);
      },
      error: err => console.error(err),
      complete: () => {}
    };
  }

  componentDidMount() {
    state$.addListener(this.stateListener);
  }

  componentWillUnmount() {
    state$.removeListener(this.stateListener);
  }

  render(props, state: HomeState) {
    return (
      <div class="pa3 mw7-ns center sans-serif">
        {state.state === 'NORMAL' && (
          <div>
            <Compass direction={state.heading} message="Hello!" />
            {state.infoText && (
              <div class="mt4 pa3 mw6-ns center bg-light-gray">
                <p class="center f5 lh-copy measure">{state.infoText}</p>
              </div>
            )}
          </div>
        )}
        {state.state === 'ERROR' && (
          <div>
            <Compass direction={0} />
            <div class="mt4 pa3 mw6-ns center bg-light-gray">
              <p class="center f5 lh-copy measure">{state.errorText}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}
