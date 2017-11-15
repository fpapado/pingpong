import { Listener } from 'xstream';
import { h, Component } from 'preact';
import { HeadingResult, orientation$ } from '../../services/orientation';
import { Compass } from '../../components/Compass';
import { unpack } from '@typed/either';

interface HomeProps {}
interface NormalState {
  state: 'NORMAL';
  direction: number;
  infoText?: string;
}
interface ErrorState {
  state: 'ERROR';
  errorText: string;
}
type HomeState = NormalState | ErrorState;

export default class Home extends Component<HomeProps, HomeState> {
  orientationListener: Listener<HeadingResult>;

  constructor() {
    super();

    this.state = {
      state: 'NORMAL',
      direction: 0
    };

    this.orientationListener = {
      next: result => {
        this.updateState(result);
      },
      error: err => console.error(err),
      complete: () => {}
    };
  }

  componentDidMount() {
    orientation$.debug().addListener(this.orientationListener);
  }

  updateState(result: HeadingResult) {
    unpack(
      value => {
        if (value === 'NOT_MOVING') {
          this.setState(prevState => ({
            state: 'NORMAL',
            direction: 0,
            infoText:
              'We cannot find your position without moving a bit. Please move :)'
          }));
        } else {
          this.setState(prevState => ({ state: 'NORMAL', direction: value }));
        }
      },
      error => {
        switch (error) {
          case 'UNAVAILABLE':
            this.setState(prevState => ({
              state: 'ERROR',
              message: 'Your device does not support detecting heading'
            }));
        }
      },
      result
    );
  }

  componentWillUnmount() {
    orientation$.removeListener(this.orientationListener);
  }

  render(props, state) {
    return (
      <div class="pa3 mw7-ns center sans-serif">
        <Compass direction={state.direction} />
        {state.infoText && (
          <div class="mt4 pa3 mw6-ns center bg-light-gray">
            <p class="center f5 lh-copy measure">{state.infoText}</p>
          </div>
        )}
      </div>
    );
  }
}
