import React, { useEffect, useState } from 'react';
import './Popup.css';
import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-node';
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';
import RouteUnauthenticated from '../../components/RouteUnauth';
import RouteAuthenticated from '../../components/RouteAuth';
import Dashboard from '../../components/Dashboard';

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
      localStorage.setItem('youtube-access-token', token);
      location.reload();
    });
  };

  const spotifyApi = new SpotifyWebApi({
    redirectUri:
      'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html',
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let { code } = params;

  useEffect(() => {
    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);
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
          localStorage.setItem(
            'spotify-token-timestamp',
            JSON.stringify(new Date())
          );
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

  const refreshTokenFunc = () => {
    axios
      .post('http://localhost:4000/api/auth/refresh/spotify', {
        refreshToken,
      })
      .then((res) => {
        localStorage.setItem('spotify-token', res.data.access_token);
        localStorage.setItem(
          'spotify-token-timestamp',
          JSON.stringify(new Date())
        );
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
  };

  useEffect(() => {
    const spotifyTokenTimeStamp = new Date(
      JSON.parse(localStorage.getItem('spotify-token-timestamp'))
    );
    const timeElapsed =
      (new Date() - spotifyTokenTimeStamp) / 1000; /* in seconds*/
    if (
      accessToken &&
      refreshToken &&
      expiresIn &&
      timeElapsed > expiresIn - 60
    ) {
      refreshTokenFunc();
    }
  }, []);

  useEffect(() => {
    if (refreshToken && expiresIn) {
      const interval = setInterval(() => {
        refreshTokenFunc();
      }, (expiresIn - 60) * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshToken, expiresIn]);

  const Login = () => {
    return (
      <div className="App">
        <h1
          style={{
            marginTop: 50,
            marginBottom: 30,
            color: 'rgba(255,255,255, 0.8)',
          }}
        >
          Spotify2YT
        </h1>
        <div className="btn-container">
          <a href="http://localhost:4000/api/auth/login/spotify">
            <button
              className="login-btn"
              style={{ background: '#1DB954', color: 'white' }}
            >
              {accessToken? 'Spotify Connected' : 'Connect Spotify'}
            </button>
          </a>
          <button
            className="login-btn"
            style={{ background: '#FF0000', color: 'white' }}
            onClick={getToken}
          >
            {ytAccessToken? 'Youtube Connected' : 'Connect Youtube'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Router>
        <Switch>
          <RouteUnauthenticated component={Login} exact path="/" />
          <RouteAuthenticated component={Dashboard} path="/dashboard" />
        </Switch>
      </Router>
    </div>
  );
};

export default Popup;
