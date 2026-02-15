/**
The MIT License (MIT)

Copyright (c) 2019 Srigar Sukumar <ssrigar@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
// Adapted from [multiselect-react-dropdown](https://github.com/srigar/multiselect-react-dropdown)

/* eslint-disable jsdoc/require-jsdoc */
// @ts-nocheck
import clsx from 'clsx';
import React, { useRef, useEffect } from 'react';

import Icon from './icon';

function useOutsideAlerter(ref, clickEvent) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        clickEvent();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}

/**
* Component that alerts if you click outside of it
*/
const OutsideAlerter = (props) => {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, props.outsideClick);
  return <div ref={wrapperRef}>{props.children}</div>;
};

interface IMultiselectProps {
  options: any;
  selectedValues?: any;
  displayValue?: string;
  placeholder?: string;
  loading?: boolean;
  emptyRecordMsg?: string;
  onSelect?: (selectedList:any, selectedItem: any) => void;
  onRemove?: (selectedList:any, selectedItem: any) => void;
  onSearch?: (value:string) => void;
  onKeyPressFn?: (event:any, value:string) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export class Multiselect extends React.Component<IMultiselectProps, any> {

  static defaultProps: IMultiselectProps;

  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      options: props.options,
      filteredOptions: props.options,
      unfilteredOptions: props.options,
      selectedValues: Object.assign([], props.selectedValues),
      toggleOptionsList: false,
      highlightOption: 0,
    };
    // @ts-ignore
    this.optionTimeout = null;
    // @ts-ignore
    this.searchWrapper = React.createRef();
    // @ts-ignore
    this.searchBox = React.createRef();
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.renderMultiselectContainer = this.renderMultiselectContainer.bind(this);
    this.renderSelectedList = this.renderSelectedList.bind(this);
    this.onRemoveSelectedItem = this.onRemoveSelectedItem.bind(this);
    this.toggleOptionList = this.toggleOptionList.bind(this);
    this.onArrowKeyNavigation = this.onArrowKeyNavigation.bind(this);
    this.onSelectItem = this.onSelectItem.bind(this);
    this.filterOptionsByInput = this.filterOptionsByInput.bind(this);
    this.removeSelectedValuesFromOptions = this.removeSelectedValuesFromOptions.bind(this);
    this.isSelectedValue = this.isSelectedValue.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.listenerCallback = this.listenerCallback.bind(this);
    this.onCloseOptionList = this.onCloseOptionList.bind(this);
  }

  initialSetValue() {
    this.removeSelectedValuesFromOptions(false);
  }

  componentDidMount() {
    this.initialSetValue();
    // @ts-ignore
    this.searchWrapper.current.addEventListener('click', this.listenerCallback);
  }

  componentDidUpdate(prevProps) {
    const { options, selectedValues } = this.props;
    const { options: prevOptions, selectedValues: prevSelectedvalues } = prevProps;
    if (JSON.stringify(prevOptions) !== JSON.stringify(options)) {
      this.setState({ options, filteredOptions: options, unfilteredOptions: options }, this.initialSetValue);
    }
    if (JSON.stringify(prevSelectedvalues) !== JSON.stringify(selectedValues)) {
      this.setState({ selectedValues: Object.assign([], selectedValues) }, this.initialSetValue);
    }
  }

  listenerCallback() {
    // @ts-ignore
    this.searchBox.current.focus();
  }

  componentWillUnmount() {
    // @ts-ignore
    if (this.optionTimeout) {
      // @ts-ignore
      clearTimeout(this.optionTimeout);
    }
    // @ts-ignore
    this.searchWrapper.current.removeEventListener('click', this.listenerCallback);
  }

  // Skipcheck flag - value will be true when the func called from on deselect anything.
  removeSelectedValuesFromOptions(skipCheck) {
    const { displayValue } = this.props;
    const { selectedValues = [], unfilteredOptions } = this.state;
    if (!selectedValues.length && !skipCheck) {
      return;
    }
    const optionList = unfilteredOptions.filter(item => {
      return selectedValues.findIndex(
        v => v[displayValue] === item[displayValue],
      ) === -1;
    });
    this.setState(
      { options: optionList, filteredOptions: optionList },
      this.filterOptionsByInput,
    );
  }

  onChange(event) {
    const { onSearch } = this.props;
    this.setState(
      { inputValue: event.target.value },
      this.filterOptionsByInput,
    );
    if (onSearch) {
      onSearch(event.target.value);
    }
  }

  onKeyPress(event) {
    const { onKeyPressFn } = this.props;
    if (onKeyPressFn) {
      onKeyPressFn(event, event.target.value);
    }
  }

  filterOptionsByInput() {
    let { options } = this.state;
    const { filteredOptions, inputValue } = this.state;
    const { displayValue } = this.props;
    options = filteredOptions.filter(i => this.matchValues(i[displayValue], inputValue));
    this.setState({ options });
  }

  matchValues(value, search) {
    if (value.toLowerCase) {
      return value.toLowerCase().indexOf(search.toLowerCase()) > -1;
    }
    return value.toString().indexOf(search) > -1;
  }

  onArrowKeyNavigation(e) {
    const {
      options,
      highlightOption,
      toggleOptionsList,
      inputValue,
      selectedValues,
    } = this.state;
    if (e.keyCode === 8 && !inputValue && selectedValues.length) {
      this.onRemoveSelectedItem(selectedValues.length - 1);
    }
    if (!options.length) {
      return;
    }
    if (e.keyCode === 38) {
      if (highlightOption > 0) {
        this.setState(previousState => ({
          highlightOption: previousState.highlightOption - 1,
        }));
      } else {
        this.setState({ highlightOption: options.length - 1 });
      }
    } else if (e.keyCode === 40) {
      if (highlightOption < options.length - 1) {
        this.setState(previousState => ({
          highlightOption: previousState.highlightOption + 1,
        }));
      } else {
        this.setState({ highlightOption: 0 });
      }
    } else if (e.key === 'Enter' && options.length && toggleOptionsList) {
      if (highlightOption === -1) {
        return;
      }
      this.onSelectItem(options[highlightOption]);
    }
    // TODO: Instead of scrollIntoView need to find better soln for scroll the dropwdown container.
    // setTimeout(() => {
    //   const element = document.querySelector("ul.optionContainer .highlight");
    //   if (element) {
    //     element.scrollIntoView();
    //   }
    // });
  }

  onRemoveSelectedItem(item) {
    const { selectedValues } = this.state;
    let { index = 0 } = this.state;
    const { onRemove, displayValue } = this.props;
    index = selectedValues.findIndex(
      i => i[displayValue] === item[displayValue],
    );
    selectedValues.splice(index, 1);
    onRemove(selectedValues, item);
    this.setState({ selectedValues }, () => {
      this.removeSelectedValuesFromOptions(true);
    });
  }

  onSelectItem(item) {
    const { selectedValues } = this.state;
    const { onSelect } = this.props;
    this.setState({
      inputValue: '',
    });
    if (this.isSelectedValue(item)) {
      this.onRemoveSelectedItem(item);
      return;
    }
    selectedValues.push(item);
    onSelect(selectedValues, item);
    this.setState({ selectedValues }, () => {
      this.removeSelectedValuesFromOptions(true);
    });
  }

  isSelectedValue(item) {
    const { displayValue } = this.props;
    const { selectedValues } = this.state;
    return (
      selectedValues.filter(i => i[displayValue] === item[displayValue])
        .length > 0
    );
  }

  renderOptionList() {
    const { emptyRecordMsg, loading, loadingMessage = 'loading...' } = this.props;
    const { options } = this.state;
    if (loading) {
      return (
        <ul className='optionContainer'>
          {typeof loadingMessage === 'string' && <span className='notFound'>{loadingMessage}</span>}
          {typeof loadingMessage !== 'string' && loadingMessage}
        </ul>
      );
    }
    return (
      <ul className='optionContainer'>
        {options.length === 0 && <span className='notFound'>{emptyRecordMsg}</span>}
        {this.renderOption()}
      </ul>
    );
  }

  renderOption() {
    const { displayValue } = this.props;
    const { highlightOption } = this.state;
    return this.state.options.map((option, i) => {
      const isSelected = this.isSelectedValue(option);
      return (
        <li
          key={`option${i}`}
          className={`option ${isSelected ? 'selected' : ''} ${highlightOption === i ? 'highlightOption highlight' : ''}`}
          onClick={() =>{
            this.onSelectItem(option);
          }}
        >
          {option[displayValue]}
        </li>
      );
    });
  }

  renderSelectedList() {
    const { displayValue } = this.props;
    const { selectedValues } = this.state;
    return selectedValues.map((value, index) => (
      <span className='chip' key={index}>
        {value[displayValue]}
        <button onClick={() =>{
          this.onRemoveSelectedItem(value);
        }}
        >
          <Icon className='ml-1 size-4 hover:cursor-pointer' src={require('@phosphor-icons/core/regular/x-circle.svg')} />
        </button>
      </span>
    ));
  }

  toggleOptionList() {
    this.setState({
      toggleOptionsList: !this.state.toggleOptionsList,
      highlightOption: 0,
    });
  }

  onCloseOptionList() {
    this.setState({
      toggleOptionsList: false,
      highlightOption: 0,
      inputValue: '',
    });
  }

  onFocus(){
    if (this.state.toggleOptionsList) {
      // @ts-ignore
      clearTimeout(this.optionTimeout);
    } else {
      this.toggleOptionList();
    }
  }

  onBlur(){
    this.setState({ inputValue: '' }, this.filterOptionsByInput);
    // @ts-ignore
    this.optionTimeout = setTimeout(this.onCloseOptionList, 250);
  }

  renderMultiselectContainer() {
    const { inputValue, toggleOptionsList } = this.state;
    const { placeholder, id, name, disabled, className } = this.props;
    return (
      <div className={clsx('multiselect-container', { 'multiselect-container--disabled': disabled }, className)} id={id}>
        <div
          className='searchWrapper'
          ref={this.searchWrapper}
        >
          {this.renderSelectedList()}
          <input
            type='text'
            ref={this.searchBox}
            className='searchBox'
            name={`${name ?? 'search-name'}-input`}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={inputValue}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            placeholder={placeholder}
            onKeyDown={this.onArrowKeyNavigation}
            autoComplete='off'
            disabled={disabled}
          />
        </div>
        <div
          className={`optionListContainer ${
            toggleOptionsList ? 'displayBlock' : 'displayNone'
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          {this.renderOptionList()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <OutsideAlerter outsideClick={this.onCloseOptionList}>
        {this.renderMultiselectContainer()}
      </OutsideAlerter>
    );
  }

}

Multiselect.defaultProps = {
  options: [],
  selectedValues: [],
  displayValue: 'model',
  placeholder: 'Select',
  emptyRecordMsg: 'No Options Available',
  onSelect: () => {},
  onRemove: () => {},
  onKeyPressFn: () => {},
  id: '',
  name: '',
  disabled: false,
  className: '',
} as IMultiselectProps;
