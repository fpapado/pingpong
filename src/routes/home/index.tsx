import xs, { MemoryStream, Stream, Listener } from 'xstream';
import throttle from 'xstream/extra/throttle';
import { h, Component } from 'preact';
import { AimResult, makeCustomAim$ } from '../../services/orientation';
import { AlertBox, Button } from '../../components/Library';
import { Flex, Box } from 'grid-styled';
import { Compass } from '../../components/Compass';
import { unpack } from '@typed/either';
import { config } from 'config';

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

const STATIC_DEST: [number, number] = config.STATIC_DEST;
const state$: MemoryStream<HomeState> = makeCustomAim$(STATIC_DEST)
  .debug()
  .map(result => stateFromAim(result))
  .startWith({ state: 'NORMAL', heading: 20 });

const stateFromAim = (aimResult: AimResult): HomeState => {
  return unpack(
    (value): HomeState => ({
      state: 'NORMAL',
      heading: value
    }),
    (err): HomeState => ({
      state: 'ERROR',
      errorText: 'Absolute orientation is not available on your device :/'
    }),
    aimResult
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
          <div class="overflow-hidden">
            <Compass direction={state.heading} message="Hello!" />
            {state.infoText && (
              <div class="mt4 measure center">
                <AlertBox type="info">{state.infoText}</AlertBox>
              </div>
            )}
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
        <Flex mt={3} align="center" justify="center">
          <Box mr={2}>
            <Button>Helsinki</Button>
          </Box>
          <Box>
            <Button pressed={true}>Porto</Button>
          </Box>
        </Flex>
      </div>
    );
  }
}
