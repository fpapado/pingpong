import { h, Component } from 'preact';
import { orientation$ } from '../../services/orientation';
import { Compass } from '../../components/Compass';

export default class Home extends Component {
  constructor() {
    super();

    this.state = {
      direction: 0
    };
  }

  componentDidMount() {
    orientation$.debug().addListener({
      next: heading => this.setState({ direction: heading }),
      error: err => console.error(err)
    });
  }

  componentWillUnmount() {
    orientation$.removeListener;
  }

  render(props, state) {
    return (
      <div class="mw7-ns center sans-serif">
        <Compass direction={state.direction} />
      </div>
    );
  }
}
