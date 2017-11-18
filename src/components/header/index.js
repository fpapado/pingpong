import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import logo from './logo.svg';

const style = {
  // active: 'blue',
  // link: 'pa2 3im link fw5 b bw1 bb'
  header: 'mt0 mb4 f2 f1-ns fw4 blue bungee'
};

export class Header extends Component {
  render() {
    return (
      <header className="ph3 pv4 tc">
        <img src={logo} />
        {/* <nav class="flex">
          <Link className={style.link} activeClassName={style.active} href="/">
            Home
          </Link>
          <Link
            className={style.link}
            activeClassName={style.active}
            href="/profile"
          >
            Me
          </Link>
          <Link
            className={style.link}
            activeClassName={style.active}
            href="/profile/john"
          >
            John
          </Link>
        </nav> */}
      </header>
    );
  }
}
