/*
  Dummy Component

  @author min yang
*/

// style
import style from 'StyleRoot/component/dummy.scss';

// dependency
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';

// default states
const getDefaultState = () => ({
  isOkToRenderContent: true,
});


class Dummy extends Component {

  constructor(args) {

    super(args);
    this.state = getDefaultState();

  }

  render() {

    const className = `${style.dummy}`;

    return (
      <div className={className}>
        this is dummy component
      </div>
    )

  }
}

Dummy.propTypes = {};
Dummy.defaultProps = {};

export default Dummy;
