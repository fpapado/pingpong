import { h, Component } from 'preact';
import {
  HeadingError,
  HeadingResult,
  HeadingSuccess,
  orientation$
} from '../../services/orientation';
import { Compass } from '../../components/Compass';
import { isLeft, fromLeft, fromRight } from '@typed/either';

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
  constructor() {
    super();

    this.state = {
      state: 'NORMAL',
      direction: 0
    };
  }

  componentDidMount() {
    orientation$.debug().addListener({
      next: result => {
        this.updateState(result);
      },
      error: err => console.error(err)
    });
  }

  updateState(res: HeadingResult) {
    if (isLeft(res)) {
      let value = fromLeft(res);
      if (value === 'NOT_MOVING') {
        this.setState(prevState => ({
          state: 'NORMAL',
          direction: 0,
          infoText:
            'We cannot find your position without moving a bit. Please move :)'
        }));
      } else {
        this.setState(prevState => ({ state: 'NORMAL', direction: res }));
      }
    } else {
      let error = fromRight(res);
      switch (error) {
        case 'UNAVAILABLE':
          this.setState(prevState => ({
            state: 'ERROR',
            message: 'Your device does not support detecting heading'
          }));
      }
    }
  }

  componentWillUnmount() {
    orientation$.removeListener;
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
