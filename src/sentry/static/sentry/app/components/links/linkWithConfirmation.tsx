import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Confirm from 'app/components/confirm';

type Props = {
  disabled?: boolean;
  message: React.ReactNode;
  title: string | undefined;
  onConfirm: () => void;
} & React.HTMLAttributes<HTMLAnchorElement>;

type State = {
  isModalOpen: boolean;
};

/**
 * <Confirm> is a more generic version of this component
 */
class LinkWithConfirmation extends React.PureComponent<Props, State> {
  static propTypes = {
    disabled: PropTypes.bool,
    message: PropTypes.node.isRequired,
    title: PropTypes.node.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  static defaultProps = {
    disabled: false,
  };

  state = {
    isModalOpen: false,
  };

  onClick = (e: React.MouseEvent) => {
    if (this.props.disabled) {
      e.preventDefault();
      return;
    }

    this.setState({isModalOpen: !this.state.isModalOpen});
  };

  render() {
    const {className, disabled, title, children, ...otherProps} = this.props;
    return (
      <Confirm {...otherProps} disabled={disabled}>
        <a
          className={classNames(className || '', {disabled})}
          onClick={this.onClick}
          title={title}
        >
          {children}
        </a>
      </Confirm>
    );
  }
}

export default LinkWithConfirmation;
