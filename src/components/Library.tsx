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

  if (props) {
    return (
      <div class={`mt3 pa3 bt bb ${alertDef[props.type].style}`} role="alert">
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
