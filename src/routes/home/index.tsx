import { Listener } from 'xstream';
import { h, Component } from 'preact';
import {
  HeadingResult,
  orientation$,
  heading$
} from '../../services/orientation';
import { Compass } from '../../components/Compass';
import { unpack } from '@typed/either';
import { MemoryStream } from 'xstream';

interface HomeProps {}
interface NormalState {
  state: 'NORMAL';
  heading: number;
  infoText?: string;
}
interface ErrorState {
  state: 'ERROR';
  errorText: string;
}
type HomeState = NormalState | ErrorState;

// const state$: MemoryStream<HomeState> = orientation$
//   .debug()
//   .map(result => getNextState(result))
//   .startWith({ state: 'NORMAL', direction: 0 });

const state$: MemoryStream<HomeState> = heading$
  .debug()
  .map(heading => {
    return { state: 'NORMAL' as 'NORMAL', heading: heading };
  })
  .startWith({ state: 'NORMAL', heading: 0 });

const getNextState = (result: HeadingResult): HomeState => {
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
            state: 'ERROR' as 'ERROR',
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
            <Compass direction={state.heading} />
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
