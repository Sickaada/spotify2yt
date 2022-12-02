import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import isAuthenticated from '../../helpers/auth';

const RouteAuthenticated = ({ component: Component, path, ...props }) => {
  if (!isAuthenticated()) {
    return <Redirect to="/" />;
  }

  return <Route component={Component} path={path} {...props} />;
};

export default RouteAuthenticated;
