/*
  Test React Component
 */

import React from 'react';
import Link from '../components/link';
import Dummy from '../components/dummy';
import renderer from 'react-test-renderer';

test('react link changes state on hover', () => {

  const link = renderer.create(
    <Link url="http://www.facebook.com">Facebook</Link>
  );

  let tree = link.toJSON();
  expect(tree).toMatchSnapshot();

  //hover testing
  tree.props.onMouseEnter();

  tree = link.toJSON();
  expect(tree).toMatchSnapshot();

  //leavec testing
  tree.props.onMouseLeave();
  tree = link.toJSON();
  expect(tree).toMatchSnapshot();

});
