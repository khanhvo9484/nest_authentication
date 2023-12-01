const SparkPost = require('sparkpost');
const sparkpostClient = new SparkPost(process.env.SPARKPOST_API_KEY, {
  endpoint: 'https://api.sparkpost.com:443',
});

export default sparkpostClient;
