import React from 'react';
import {mountWithTheme, shallow} from 'sentry-test/enzyme';

import SelectControlLegacy from 'app/components/forms/selectControlLegacy';

describe('SelectControlLegacy', function() {
  it('renders with react-select "options"', function() {
    const wrapper = shallow(
      <SelectControlLegacy options={[{value: 'foo', label: 'Foo'}]} />
    );

    expect(wrapper.find('StyledSelect').prop('options')).toEqual([
      {value: 'foo', label: 'Foo'},
    ]);
  });

  it('renders with react-select "multi"', function() {
    let wrapper = shallow(<SelectControlLegacy multiple />);

    expect(wrapper.find('StyledSelect').prop('multi')).toEqual(true);

    wrapper = shallow(<SelectControlLegacy multi />);

    expect(wrapper.find('StyledSelect').prop('multi')).toEqual(true);

    wrapper = shallow(<SelectControlLegacy />);

    expect(wrapper.find('StyledSelect').prop('multi')).toBeUndefined();
  });

  it('renders with select2 flat "choices"', function() {
    const wrapper = shallow(
      <SelectControlLegacy choices={['a', 'b', 'c']} name="fieldName" />
    );
    expect(wrapper.find('StyledSelect').prop('options')).toEqual([
      {value: 'a', label: 'a'},
      {value: 'b', label: 'b'},
      {value: 'c', label: 'c'},
    ]);
  });

  it('renders with select2 paired "choices"', function() {
    const wrapper = shallow(
      <SelectControlLegacy
        choices={[['a', 'abc'], ['b', 'bcd'], ['c', 'cde']]}
        name="fieldName"
      />
    );
    expect(wrapper.find('StyledSelect').prop('options')).toEqual([
      {value: 'a', label: 'abc'},
      {value: 'b', label: 'bcd'},
      {value: 'c', label: 'cde'},
    ]);
  });

  it('renders with complex objects with paired "choices"', function() {
    const mock = jest.fn();
    const Foo = <div>Foo</div>;
    const Bar = <div>Bar</div>;

    const wrapper = mountWithTheme(
      <SelectControlLegacy
        choices={[[{id: 'foo', name: 'Foo'}, Foo], [{id: 'bar', name: 'Bar'}, Bar]]}
        name="fieldName"
        onChange={mock}
      />
    );
    expect(wrapper.find('StyledSelect').prop('options')).toEqual([
      {value: {id: 'foo', name: 'Foo'}, label: Foo},
      {value: {id: 'bar', name: 'Bar'}, label: Bar},
    ]);

    wrapper.find('input').simulate('focus');
    wrapper.find('.Select-control').simulate('mouseDown', {button: 0});
    expect(
      wrapper
        .find('div.Select-option')
        .first()
        .prop('children')
    ).toEqual(Foo);

    wrapper
      .find('Option')
      .first()
      .simulate('mouseDown');

    expect(mock).toHaveBeenCalledWith({
      value: {id: 'foo', name: 'Foo'},
      label: Foo,
    });
  });
});
