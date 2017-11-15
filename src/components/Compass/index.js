import { h, Component } from 'preact';
import styles from './styles';

export class Compass extends Component {
  state = {
    oldAngle: 0
  };

  static defaultProps = {
    direction: 0,
    directionNames: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  };

  directionName = dir => {
    let sections = this.props.directionNames.length,
      sect = 360 / sections,
      x = Math.floor((dir + sect / 2) / sect);

    x = x >= sections ? 0 : x;

    return this.props.directionNames[x];
  };

  normalizeAngle = direction => {
    let newAngle = direction,
      rot = this.oldAngle || 0,
      ar = rot % 360;

    while (newAngle < 0) {
      newAngle += 360;
    }
    while (newAngle > 360) {
      newAngle -= 360;
    }
    while (rot < 0) {
      rot += 360;
    }
    while (rot > 360) {
      rot -= 360;
    }

    if (ar < 0) {
      ar += 360;
    }
    if (ar < 180 && newAngle > ar + 180) {
      rot -= 360;
    }
    if (ar >= 180 && newAngle <= ar - 180) {
      rot += 360;
    }

    rot += newAngle - ar;
    this.oldAngle = rot;

    return rot;
  };

  render() {
    let dir = this.normalizeAngle(this.props.direction);
    let name = this.directionName(dir);
    let rotate = `transform: rotate(-${dir}deg)`;

    return (
      <div className={styles.compass}>
        <div className={styles.compass__windrose} style={rotate}>
          {[...Array(10)].map((k, i) => (
            <div className={styles.compass__mark} key={i + 1} />
          ))}
          <div className={styles['compass__mark--direction-h']} />
          <div className={styles['compass__mark--direction-v']} />
        </div>

        <div className={styles['compass__arrow-container']}>
          <div className={styles.compass__arrow} />
          <div className={styles.compass__labels}>
            <span>{name}</span>
            <span>
              {dir}
              <sup>o</sup>
            </span>
          </div>
        </div>
      </div>
    );
  }
}
