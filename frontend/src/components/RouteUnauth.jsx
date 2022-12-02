import React from 'react';
import { Redirect, Route} from 'react-router-dom';

import isAuthenticated from '../../helpers/auth';

const RouteUnauthenticated = ({ component: Component, path, ...props }) => {
  if (isAuthenticated()) {
    return <Redirect to="/dashboard" />;
  }

  return <Route component={Component} path={path} {...props}/>;
};

export default RouteUnauthenticated;
