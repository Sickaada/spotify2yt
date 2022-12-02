const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const PORT = process.env.PORT || 4000
const spotifyAuthRoute = require('./routes/auth/spotifyAuth')
const youtubeAuthRoute = require('./routes/auth/youtubeAuth')

const app = express();

const corsOptions = {
    origin: 'chrome-extension://pnlllofibghnggabgfagediogplbncga',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}


app.use(express.json())
app.use(cors());
dotenv.config();

app.get("/", (req, res) => {
    res.status(200).json({
        message : "sab chnaga si"
    })
})

app.use("/api/auth", spotifyAuthRoute)
app.use("/api/auth", youtubeAuthRoute)
app.listen(PORT, () => console.log(`server running at port ${PORT}`))