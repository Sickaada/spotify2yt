const router = require("express").Router();
const { process } = require("@hapi/joi/lib/errors");
const axios = require("axios")
const SpotifyWebApi = require('spotify-web-api-node')
require('dotenv').config({ path: __dirname + '/./../../.env' })
var redirect_uri = 'http://localhost:3000';
console.log();


router.get('/login/spotify', (req, res) => {
    var scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';

    res.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: "18ce45390c5a4ed0a7a949940a919d36",
            scope: scope,
            redirect_uri: "chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html",
        }).toString());
})

router.post('/req-token/spotify', async (req, res) => {
    const { code } = req.body;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: 'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html',
        clientId: "18ce45390c5a4ed0a7a949940a919d36",
        clientSecret: "fc211a18c03e458e95224c9aaa333a40"
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
    const { refreshToken } = req.body
    const spotifyApi = new SpotifyWebApi({
        redirectUri: 'chrome-extension://pnlllofibghnggabgfagediogplbncga/popup.html',
        clientId: "18ce45390c5a4ed0a7a949940a919d36",
        clientSecret: "fc211a18c03e458e95224c9aaa333a40",
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