const { google } = require("googleapis");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config();

// Configure Twitter client with your credentials
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = twitterClient.readWrite;

// Configure YouTube client with your API key
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_AUTH_TOKEN,
});

const playlistId = process.env.YOUTUBE_PLAYLIST_ID;

// Function to fetch playlist items
async function getPlaylistItems(playlistId) {
  const response = await youtube.playlistItems.list({
    part: "snippet",
    maxResults: 1000,
    playlistId: playlistId,
  });
  return response.data.items;
}

// Function to post a tweet
async function postTweet(status) {
  try {
    const result = await rwClient.v2.tweet(status);
    console.log("Tweet posted successfully:", result);
  } catch (error) {
    console.error("Error posting tweet:", error);
  }
}

async function tweetRandomSong() {
  try {
    const items = await getPlaylistItems(playlistId);
    if (!items || items.length === 0) {
      console.error("No songs found in the playlist.");
      return;
    }

    // Fisher-Yates Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    const selectedItem = items[0];
    const videoId = selectedItem.snippet.resourceId.videoId;
    const videoTitle = selectedItem.snippet.title;
    const tweetText = `Song: "${videoTitle}" \n #సిరివెన్నెల_సీతారామశాస్త్రి
                        \n https://music.youtube.com/watch?v=${videoId}&list=${playlistId}`;

    await postTweet(tweetText);
  } catch (error) {
    console.error("Error tweeting song:", error);
  }
}

// This function will be called by GitHub Actions
tweetRandomSong();
