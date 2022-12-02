const isAuthenticated = () => {
    const spotifyToken = localStorage.getItem('spotify-token');
    const youtubeToken = localStorage.getItem('youtube-access-token');

    return spotifyToken && youtubeToken;
 }

 export default isAuthenticated