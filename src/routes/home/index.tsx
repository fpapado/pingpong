import xs, { Listener, MemoryStream, Producer, Stream } from 'xstream';
import throttle from 'xstream/extra/throttle';
import { h, Component } from 'preact';
import { AimResult, makeCustomAim$, LatLng } from '../../services/orientation';
import { AlertBox, Button } from '../../components/Library';
import { Flex, Box } from 'grid-styled';
import { Compass } from '../../components/Compass';
import { unpack } from '@typed/either';
import { config } from 'config';

interface HomeProps {}

type HomeState = NormalState | ErrorState;

interface NormalState {
  state: 'NORMAL';
  heading: number;
  buttons: Array<ButtonState>;
  infoText?: string;
}

interface ErrorState {
  state: 'ERROR';
  errorText: string;
}

interface ButtonState {
  key: string;
  pressed: boolean;
  targetPosition: LatLng;
}

const STATIC_DEST: [number, number] = config.STATIC_DEST;

const initButtons = [
  {
    key: 'Helsinki',
    pressed: false,
    targetPosition: [60.192, 24.9458] as LatLng
  },
  {
    key: 'Porto',
    pressed: true,
    targetPosition: STATIC_DEST
  }
];

const targetPosition$: MemoryStream<LatLng> = xs.of(STATIC_DEST).remember();

const state$: MemoryStream<HomeState> = makeCustomAim$(targetPosition$)
  .debug()
  .map(result => stateFromAim(result))
  .startWith({ state: 'NORMAL', heading: 0, buttons: initButtons });

// TODO: functional setState, move into component
const stateFromAim = (aimResult: AimResult): HomeState => {
  return unpack(
    (value): HomeState => ({
      state: 'NORMAL',
      heading: value,
      buttons: initButtons
    }),
    (err): HomeState => ({
      state: 'ERROR',
      errorText: 'Absolute orientation is not available on your device :/'
    }),
    aimResult
  );
};

const setTargetPosition = ({ key, targetPosition }) => {
  console.log(key, targetPosition);
  targetPosition$.shamefullySendNext(targetPosition);
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
          <div class="">
            <Compass direction={state.heading} message="Hello!" />
            {state.infoText && (
              <div class="mt4 measure center">
                <AlertBox type="info">{state.infoText}</AlertBox>
              </div>
            )}
            <Flex mt={3} align="center" justify="center">
              {state.buttons.map(button => (
                <Box mr={2} key={button.key} sizing="border-box">
                  <Button pressed={button.pressed} onClick={ev => setTargetPosition(button)}>
                    {button.key}
                  </Button>
                </Box>
              ))}
            </Flex>
          </div>
        )}
        {state.state === 'ERROR' && (
          <div class="overflow-hidden">
            <Compass direction={0} />
            <div class="mt4 measure center">
              <AlertBox type="error">{state.errorText}</AlertBox>
            </div>
          </div>
        )}
      </div>
    );
  }
}
