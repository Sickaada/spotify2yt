import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [spotifyPL, setSpotifyPL] = useState([]);
  const [ytPL, setYtPL] = useState([]);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('spotify-token') || null
  );
  const [ytAccessToken, setYtAccessToken] = useState(
    localStorage.getItem('youtube-access-token') || null
  );

  const logout = () => {
    localStorage.removeItem('spotify-token');
    localStorage.removeItem('youtube-access-token');
    chrome.identity.launchWebAuthFlow(
      { url: 'https://accounts.google.com/logout' },
      function (tokenUrl) {
        console.log(tokenUrl);
      }
    );
    location.reload();
  };

  useEffect(() => {
    if (accessToken) {
      axios
        .get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
        })
        .then((res) => {
          console.log(res);
          setSpotifyPL(res.data.items);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  useEffect(() => {
    if (ytAccessToken) {
      axios
        .get(
          'https://www.googleapis.com/youtube/v3/playlists?' +
            new URLSearchParams({
              access_token: ytAccessToken,
              mine: true,
            })
        )
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
  }, []);

  const convertPlaylist = (url) => {
    if (accessToken) {
      console.log(accessToken)
      axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      })
      .then(res => {
        console.log(res.data.tracks.items)
        const tracks = res.data.tracks.items;
        const trackTitleArray = [];
        tracks.forEach(track => {
          trackTitleArray.push(track.track.name + " " + track.track.artists[0].name)
        })
        console.log(trackTitleArray)
      })
      .catch(err => console.log(err));
    }
  };

  return (
    <div>
      <h1>Hello gays, today i have a list of top 5 playlists</h1>
      <h1>Spotify playlists</h1>
      <div style={{ height: 200, overflowY: 'scroll' }}>
        {spotifyPL.length > 0 &&
          spotifyPL.map((playlist) => {
            return (
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <img
                  style={{ width: 60, height: 60 }}
                  src={playlist.images[0].url}
                />
                <h4>{playlist.name}</h4>
                <button onClick={() => convertPlaylist(playlist.href)}>
                  Convert to YT
                </button>
              </div>
            );
          })}
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Dashboard;
