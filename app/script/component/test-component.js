/**
 * Test component
 */


// style
import style from 'StyleRoot/component/test.scss';

// dependency
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';

// static component
const TestEl = (props) => {

  const { rId, onClickHandler } = props;

  const className = `${style.testBox}`;

  return (
    <div className={className}>
      <h2 className={ style.testBox__title }>rID: {rId}</h2>
      <button onClick={onClickHandler}>Click this</button>
    </div>
  );

}

// functional component
class Test extends Component {

  constructor(arg) {

    super(arg);

    this.state = { rId : -1 };

  }

  render() {

    const props = {
      rId: this.state.rId,
      onClickHandler: this.onClick.bind(this),
    }

    console.log(props);

    return (
      <TestEl {...props}/>
    )

  }

  onClick(e) {

    e.preventDefault();

    this.setState({ rId : Math.round(Math.random() * 200) });

  }

  componentDidMount() {}

}

export default Test;
