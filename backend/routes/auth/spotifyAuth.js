const router = require("express").Router();
const axios = require("axios")
const SpotifyWebApi = require('spotify-web-api-node')

var redirect_uri = 'http://localhost:3000';


router.get('/login/spotify', (req, res) => {
    var scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';

    res.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: "chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html",
        }).toString());
})

router.post('/req-token/spotify', async (req, res) => {
    const { code } = req.body;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: 'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html',
        clientId : process.env.SPOTIFY_CLIENT_ID,
        clientSecret : process.env.SPOTIFY_CLIENT_SECRET
    })

    spotifyApi.authorizationCodeGrant(code)
    .then(data => res.status(200).json({
        ...data.body
    }))
    .catch(err => res.status(400).json({
        err
    }))
})

router.post('/refresh/spotify', async (req, res) => {
    console.log('refreshing')
    const {refreshToken} = req.body
    const spotifyApi = new SpotifyWebApi({
        redirectUri: 'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        refreshToken
    })

    spotifyApi.refreshAccessToken()
        .then(data => res.status(200).json({
            ...data.body
        }))
        .catch(err => res.status(400).json({
            err
        }))
})


module.exports = router;