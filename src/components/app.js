import { h, Component } from 'preact';
import { Router } from 'preact-router';

import { Header } from './header';
import { Container } from './Container';
import Home from '../routes/home';
// import Home from 'async!../routes/home';
// import Profile from 'async!../routes/profile';

export default class App extends Component {
  /** Gets fired when the route changes.
   *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
   *	@param {string} event.url	The newly routed URL
   */
  handleRoute = e => {
    this.currentUrl = e.url;
  };

  render() {
    return (
      <div id="app" class="h-100 bg-site-blue min-vh-100">
        <Container>
          <Header />
          <Router onChange={this.handleRoute}>
            <Home path="/" />
          </Router>
        </Container>
      </div>
    );
  }
}
