/**
 * Root component
 * @type {Object}
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import style from 'StyleRoot/component/root.scss';

import { NavLink } from 'react-router-dom'


// components
import TestComponent from './test-component';

class Root extends Component {

  render() {

    const { children } = this.props;

    // pass all props to children
    const clone = React.cloneElement(children, {...this.props});

    const className = `${style.root}`;

    return (

      <div className={ className }>


        <ul>
          <li>
            <NavLink to="/">home</NavLink>
          </li>
          <li>
            <NavLink to="page1">test page</NavLink>
          </li>
        </ul>

        <div className={ style.rootInner}>

          { clone }

        </div>
      </div>

    );

  }

}

export default Root;
