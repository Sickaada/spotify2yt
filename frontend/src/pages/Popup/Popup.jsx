import React, { useEffect, useState } from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';
import axios from 'axios';
import { Buffer } from 'buffer';
import SpotifyWebApi from 'spotify-web-api-node';
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';
import RouteUnauthenticated from '../../components/RouteUnauth';
import RouteAuthenticated from '../../components/RouteAuth';

const Popup = () => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('spotify-token') || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('spotify-refresh-token') || null
  );
  const [expiresIn, setExpiresIn] = useState(
    parseInt(localStorage.getItem('spotify-expiresIn')) || null
  );

  const [ytAccessToken, setYtAccessToken] = useState(
    localStorage.getItem('youtube-access-token') || null
  );

  const [user, setUser] = useState();

  const getToken = () => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      console.log('google token', token);
      localStorage.setItem('youtube-access-token', token);
    });
    location.reload()
  };

  const spotifyApi = new SpotifyWebApi({
    redirectUri:
      'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html',
    clientId: '18ce45390c5a4ed0a7a949940a919d36',
    clientSecret: 'fc211a18c03e458e95224c9aaa333a40',
  });

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let { code } = params;

  useEffect(() => {
    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);
      spotifyApi
        .getMe()
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
    }
  }, [accessToken]);

  useEffect(() => {
    if (code) {
      axios
        .post('http://localhost:4000/api/auth/req-token/spotify', {
          code,
        })
        .then((res) => {
          localStorage.setItem('spotify-token', res.data.access_token);
          localStorage.setItem('spotify-refresh-token', res.data.refresh_token);
          localStorage.setItem(
            'spotify-expiresIn',
            res.data.expires_in.toString()
          );
          setAccessToken(res.data.access_token);
          setRefreshToken(res.data.refresh_token);
          setExpiresIn(res.data.expires_in);
          window.history.pushState({}, null, '/popup.html');
        })
        .catch(
          (err) =>
            (window.location =
              'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html')
        );
    }
  }, []);

  useEffect(() => {
    if (refreshToken && expiresIn) {
      const interval = setInterval(() => {
        axios
          .post('http://localhost:4000/api/auth/refresh/spotify', {
            refreshToken,
          })
          .then((res) => {
            console.log({ res });
            localStorage.setItem('spotify-token', res.data.access_token);
            localStorage.setItem(
              'spotify-expiresIn',
              res.data.expires_in.toString()
            );
            setAccessToken(res.data.access_token);
            setExpiresIn(res.data.expires_in);
          })
          .catch((err) => {
            console.log(err);
            window.location =
              'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html';
          });
      }, (expiresIn - 60) * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshToken, expiresIn]);

  const logout = () => {
    localStorage.removeItem('spotify-token');
    localStorage.removeItem('youtube-access-token');
    location.reload()
  }

  const Login = () => {
    return (
      <div className="App">
        <a href="http://localhost:4000/api/auth/login/spotify">
          <button>Spotify se login karein</button>
        </a>
        <button onClick={getToken}>youtube se login karein</button>
      </div>
    );
  };

  const Dashboard = () => {
    return (
      <div>
        <h1>Hello gays, today i have a list of top 5 playlists</h1>
        <button onClick={logout}>Logout</button>
      </div>
    );
  };

  return (
    <div>
      <Router>
        <Switch>
          {/* <Route exact path='/'>
            <Login/>
          </Route> */}
          <RouteUnauthenticated component={Login} exact path="/" />
          <RouteAuthenticated
            component={Dashboard}
            path="/dashboard"
          />
        </Switch>
      </Router>
    </div>
  );
};

export default Popup;
