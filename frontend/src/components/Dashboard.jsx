import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [spotifyPL, setSpotifyPL] = useState([]);
  const [loading, setLoading] = useState({
    id: null,
    loading: false,
  });
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('spotify-token') || null
  );
  const [ytAccessToken, setYtAccessToken] = useState(
    localStorage.getItem('youtube-access-token') || null
  );

  const logout = async () => {
    // await axios
    //   .post(`https://oauth2.googleapis.com/revoke?token=${ytAccessToken}`, {
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //   })
    //   .then((res) => {
    //     localStorage.removeItem('spotify-token');
    //     localStorage.removeItem('youtube-access-token');
    //     chrome.identity.removeCachedAuthToken({ token: ytAccessToken }, () => {
    //       location.reload();
    //     });
    //   })
    //   .catch((err) => console.log(err));
    localStorage.removeItem('spotify-token');
    chrome.identity.removeCachedAuthToken({ token: ytAccessToken }, () => {
      localStorage.removeItem('youtube-access-token');
      location.reload();
    });
  };

  useEffect(() => {
    setLoading({
      id: 'menu',
      loading: true,
    });
    if (accessToken) {
      axios
        .get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
        })
        .then((res) => {
          setSpotifyPL(res.data.items);
          setLoading({
            id: 'menu',
            loading: false,
          });
        })
        .catch((err) => {
          setLoading({
            id: 'menu',
            loading: false,
          });
          console.log(err);
        });
    }
  }, []);

  const convertPlaylist = async (url, id) => {
    setLoading({
      id,
      loading: true,
    });
    try {
      if (accessToken) {
        const { trackTitleArray, playlistName, status } = await axios
          .get(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + accessToken,
            },
          })
          .then((res) => {
            const tracks = res.data.tracks.items;
            var playlistName = res.data.name;
            var trackTitleArray = tracks.map((track) => {
              return track.track.name + ' ' + track.track.artists[0].name;
            });
            return {
              trackTitleArray,
              playlistName,
              status: res.status,
            };
          });
        // .catch((err) => {
        //   console.log(err);
        // });
        // if (status !== 200) {
        //   setLoading({
        //     id,
        //     loading: false,
        //   });
        //   return;
        // }

        if (trackTitleArray.length > 0 && ytAccessToken) {
          var playlist_id;
          const { status, playlistId } = await axios
            .post(
              'https://youtube.googleapis.com/youtube/v3/playlists?' +
                new URLSearchParams({
                  part: 'id,snippet',
                  access_token: ytAccessToken,
                }).toString(),
              {
                snippet: {
                  title: playlistName,
                },
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + ytAccessToken,
                },
              }
            )
            .then((res) => {
              return { status: res.status, playlistId: res.data.id };
            });
          // .catch((err) => console.log(err));

          playlist_id = playlistId;

          // if (status !== 200) {
          //   setLoading({
          //     id,
          //     loading: false,
          //   });
          //   return;
          // }

          var toAddArray = [];
          const videosPromise = trackTitleArray.map(async (q) => {
            return await axios.get(
              `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${q}`,
              {
                headers: {
                  Accept: 'application/json',
                  Authorization: 'Bearer ' + ytAccessToken,
                },
              }
            );
          });

          await Promise.all([...videosPromise]).then((values) => {
            values?.map((value) => toAddArray.push(value.data.items[0]?.id));
          });
          // .catch((err) => console.log(err));
        }
        const increment = 1000;
        var delay = 0;
        const addVideosPromise = toAddArray.map(async (id) => {
          delay += increment;
          return new Promise((resolve) => setTimeout(resolve, delay)).then(
            async () => {
              return await axios.post(
                'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet',
                {
                  snippet: {
                    playlistId: playlist_id,
                    resourceId: {
                      ...id,
                    },
                  },
                },
                {
                  headers: {
                    Authorization: 'Bearer ' + ytAccessToken,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                }
              );
            }
          );
        });
        await Promise.all([...addVideosPromise]).then((values) => {
          setLoading({
            id,
            loading: false,
          });
          showDialog('Playlist converted');
        });
        // .catch((err) => console.log(err));
      }
    } catch (err) {
      setLoading({
        id,
        loading: false,
      });
      showDialog('There was a error, please logout and try again');
      console.log(err);
    }
  };

  const [dialog, setDialog] = useState({
    show: false,
    message: '',
  });
  const showDialog = (message) => {
    setDialog({
      show: true,
      message,
    });
    setTimeout(() => {
      setDialog({
        show: false,
      });
    }, 2000);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <h1 style={{ color: 'rgba(255,255,255, 0.8)' }}>Spotify2YT</h1>
          <button
            className="convert-button"
            style={{ color: 'white' }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
        <h3 style={{ color: 'rgba(255,255,255, 0.7)' }}>
          Your spotify playlists
        </h3>
        <div style={{ height: 200, overflowY: 'scroll' }}>
          {loading.id === 'menu' && loading.loading && (
            <h4 style={{ color: 'rgba(255,255,255, 0.7)' }}>
              Loading playlists...
            </h4>
          )}
          {spotifyPL.length > 0 &&
            spotifyPL.map((playlist, index) => {
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    alignItems: 'center',
                  }}
                >
                  <img
                    style={{ width: 60, height: 60 }}
                    src={playlist.images[0]?.url}
                  />
                  <h4
                    style={{
                      width: '170px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      color: 'rgba(255,255,255,0.6)',
                      paddingLeft: '10px',
                    }}
                  >
                    {playlist.name}
                  </h4>
                  <div style={{ width: '100px' }}>
                    <button
                      className="convert-button"
                      style={{ color: 'white' }}
                      onClick={() =>
                        convertPlaylist(playlist.href, playlist.id)
                      }
                    >
                      {loading.id === playlist.id && loading.loading
                        ? 'Converting'
                        : 'Convert'}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        <div
          style={{
            display: dialog.show ? 'flex' : 'none',
            position: 'absolute',
            width: 200,
            height: 50,
            bottom: '1px',
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            background: 'white',
            border: '1px solid black',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h5>{dialog.message}</h5>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
