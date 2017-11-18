import { h, FunctionalComponent, ComponentProps } from 'preact';

interface ViewProps extends ComponentProps<any> {
  classExtras?: string;
}

interface AlertBoxProps {
  type: keyof AlertDef;
}

interface AlertDef {
  info: AlertView;
  error: AlertView;
}

interface AlertView {
  style: string;
  label: string;
}

export const AlertBox: FunctionalComponent<AlertBoxProps> = props => {
  const alertDef: AlertDef = {
    info: { style: 'dark-blue bg-lightest-blue b--blue', label: 'Info' },
    error: { style: 'dark-red bg-washed-red b--red', label: 'Error' }
  };

  // 0 2px 5px 0 rgba(0,0,0,0.27), 0 1px 1px 0 rgba(0,0,0,0.15)
  if (props) {
    return (
      <div class={`mt3 pa3 ba bw1 ${alertDef[props.type].style}`} role="alert">
        <Paragraph classExtras="b">{alertDef[props.type].label}</Paragraph>
        <Paragraph>{props.children}</Paragraph>
      </div>
    );
  } else {
    return <div />;
  }
};

export const Paragraph = (props: ViewProps) => {
  return <p class={`mv0 lh-copy ${props.classExtras}`}>{props.children}</p>;
};

export const Button = ({ children, onClick, pressed }: any) => {
  let baseCls =
    'ph4 pv2 f5 b lh-copy tc bg-white dark-gray ba bw1 b--dark-gray';
  let clickableCls = 'hover-bg-white pointer btn-shadow';
  let pressedCls = 'btn-pressed';
  let cls = `${baseCls} ${pressed ? pressedCls : clickableCls}`;

  return (
    <button onClick={onClick} class={cls}>
      {children}
    </button>
  );
};
