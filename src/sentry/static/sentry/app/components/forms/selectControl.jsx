import React from 'react';
import {css} from 'react-emotion';
import ReactSelect, {
  components as selectComponents,
  Async,
  Creatable,
  AsyncCreatable,
} from 'react-select';

import theme from 'app/utils/theme';
import InlineSvg from 'app/components/inlineSvg';
import convertFromSelect2Choices from 'app/utils/convertFromSelect2Choices';

import SelectControlLegacy from './selectControlLegacy';

const ClearIndicator = props => (
  <selectComponents.ClearIndicator {...props}>
    <InlineSvg src="icon-close" size="10px" />
  </selectComponents.ClearIndicator>
);

const DropdownIndicator = props => (
  <selectComponents.DropdownIndicator {...props}>
    <InlineSvg src="icon-chevron-down" size="14px" />
  </selectComponents.DropdownIndicator>
);

const MultiValueRemove = props => (
  <selectComponents.MultiValueRemove {...props}>
    <InlineSvg src="icon-close" size="8px" />
  </selectComponents.MultiValueRemove>
);

// TODO(epurkhiser): The loading indicator should probably also be our loading
// indicator.

const indicatorStyles = ({padding: _padding, ...provided}) => css`
  ${provided}
  padding: 4px;
  align-items: center;
  cursor: pointer;
`;

const defaultStyles = {
  control: (_, state) => css`
    font-size: 15px;
    color: ${theme.gray5};
    display: flex;
    background: #fff;
    border: 1px solid ${theme.borderDark};
    border-radius: ${theme.borderRadius};
    box-shadow: inset ${theme.dropShadowLight};
    transition: border 0.1s linear;
    align-items: center;
    min-height: 36px;

    &:hover {
      border-color: ${theme.gray1};
    }

    ${state.isFocused &&
      css`
        border: 1px solid ${theme.gray1};
        box-shadow: rgba(209, 202, 216, 0.5) 0 0 0 3px;
      `};

    ${state.menuIsOpen &&
      css`
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        box-shadow: none;
      `};

    ${state.isDisabled &&
      css`
        border-color: ${theme.borderDark};
        background: ${theme.whiteDark};
        color: ${theme.gray2};
        cursor: not-allowed;
      `};
  `,
  menu: provided => css`
    ${provided};
    z-index: ${theme.zIndex.dropdown};
    margin-top: -1px;
    background: #fff;
    border: 1px solid ${theme.borderDark};
    border-radius: 0 0 ${theme.borderRadius} ${theme.borderRadius};
    border-top: 1px solid ${theme.borderLight};
    box-shadow: ${theme.dropShadowLight};
  `,
  option: (provided, state) => css`
    ${provided};
    line-height: 1.5;
    font-size: ${theme.fontSizeMedium};
    color: ${state.isSelected || state.isFocused ? theme.white : theme.textColor};
    background-color: ${state.isSelected
      ? theme.purpleLightest
      : state.isFocused
      ? theme.purpleLight
      : 'none'};
  `,
  valueContainer: provided => css`
    ${provided};
    align-items: flex-start;
  `,
  multiValue: () => css`
    color: #007eff;
    background-color: #ebf5ff;
    border-radius: 2px;
    border: 1px solid #c2e0ff;
    display: flex;
    margin-top: 4px;
    margin-right: 4px;
  `,
  multiValueLabel: provided => css`
    ${provided};
    color: #007eff;
    padding: 0;
    padding-left: 6px;
    line-height: 1.8;
  `,
  multiValueRemove: () => css`
    cursor: pointer;
    align-items: center;
    border-left: 1px solid #c2e0ff;
    border-radius: 0 2px 2px 0;
    display: flex;
    padding: 0 4px;
    margin-left: 4px;

    &:hover {
      color: #6284b9;
      background: #cce5ff;
    }
  `,
  indicatorsContainer: () => css`
    display: grid;
    grid-auto-flow: column;
    grid-gap: 2px;
    margin-right: 6px;
  `,
  clearIndicator: indicatorStyles,
  dropdownIndicator: indicatorStyles,
  loadingIndicator: indicatorStyles,
};

const SelectControl = props => {
  // TODO(epurkhiser): We should remove all SelectControls (and SelectFields,
  // SelectAsyncFields, etc) that are using this prop, before we can remove the
  // v1 react-select component.
  if (props.deprecatedSelectControl) {
    const {deprecatedSelectControl: _, ...legacyProps} = props;
    return <SelectControlLegacy {...legacyProps} />;
  }

  const {
    async,
    creatable,
    options,
    choices,
    clearable,
    components,
    styles,
    value,
    ...rest
  } = props;

  // Compatibility with old select2 API
  const choicesOrOptions =
    convertFromSelect2Choices(typeof choices === 'function' ? choices(props) : choices) ||
    options;

  // Value is expected to be object like the options list, we map it back from
  // the options list
  const mappedValue = choicesOrOptions.find(opt => opt.value === value);

  // Allow the provided `styles` prop to override default styles using the same
  // function interface provided by react-styled. This ensures the `provided`
  // styles include our overridden default styles
  const mappedStyles = Object.keys(styles || {}).reduce((computedStyles, key) => {
    const styleFunc = (provided, state) =>
      styles[key](
        computedStyles[key] === undefined
          ? provided
          : computedStyles[key](provided, state),
        state
      );
    return {...computedStyles, [key]: styleFunc};
  }, defaultStyles);

  const replacedComponents = {
    ClearIndicator,
    DropdownIndicator,
    MultiValueRemove,
    IndicatorSeparator: null,
  };

  return (
    <SelectPicker
      styles={mappedStyles}
      components={{...replacedComponents, ...components}}
      async={async}
      creatable={creatable}
      clearable={clearable}
      backspaceRemovesValue={clearable}
      value={mappedValue}
      isMulti={props.multiple || props.multi}
      options={choicesOrOptions}
      {...rest}
    />
  );
};

SelectControl.propTypes = SelectControlLegacy.propTypes;

const SelectPicker = ({async, creatable, forwardedRef, ...props}) => {
  // Pick the right component to use
  let Component;
  if (async && creatable) {
    Component = AsyncCreatable;
  } else if (async && !creatable) {
    Component = Async;
  } else if (creatable) {
    Component = Creatable;
  } else {
    Component = ReactSelect;
  }

  return <Component ref={forwardedRef} {...props} />;
};

SelectPicker.propTypes = SelectControl.propTypes;

export default SelectControl;
