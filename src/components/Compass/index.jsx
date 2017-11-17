import { h, Component } from 'preact';
import styles from './styles';

export class Compass extends Component {
  state = {
    oldAngle: 0
  };

  static defaultProps = {
    direction: 0
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

  render({ direction, message }, state) {
    let dir = this.normalizeAngle(direction);
    let aligned = (dir >= 0 && dir <= 10) || (dir <= 360 && dir >= 350);
    let messageShown = aligned ? message || '' : '';

    let rotate = `transform: rotate(${dir}deg)`;
    let highlight = aligned ? 'background-color: #833f3f' : '';

    let windroseCls = `${styles.compass__windrose} ${styles.animatecolor}
    ${aligned ? styles['compass__windrose--aligned'] : ''}`;

    let arrowCls = `${styles.compass__arrow} ${styles.animatecolor}
    ${aligned ? styles['compass__arrow--aligned'] : ''}`;

    return (
      <div className={styles.compass}>
        <div className={windroseCls} style={rotate}>
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
          <div className={styles.compass__mark} />
        </div>

        <div
          className={`${styles['compass__arrow-container']} ${
            styles.animatecolor
          }`}
        >
          <div className={arrowCls} />
          <div className={styles.compass__labels}>
            <span>{messageShown}</span>
            <span>
              {dir.toFixed(2)}
              <sup>o</sup>
            </span>
          </div>
        </div>
      </div>
    );
  }
}
