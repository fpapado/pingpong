import { h, Component } from 'preact';
import { Link } from 'preact-router/match';

const style = {
  // active: 'blue',
  // link: 'pa2 3im link fw5 b bw1 bb'
  header: 'mv4 f2 f1-ns blue sans-serif'
};

export class Header extends Component {
  render() {
    return (
      <header className="tc">
        <h1 className={style.header}>Ping Pong</h1>
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
