require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { urlencoded } = require('body-parser');
const app = express();
const dns = require('dns');
const { url } = require('inspector');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


const urlDatabase = {};
let nextShortUrlId = 1;

const isValidUrl = (url) => {
  try {
    const pattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/\S*)?$/;
    return pattern.test(url);
  } catch (err) {
    return false;
  }
};

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    res.json({ error: 'invalid url' });
    return;
  }

  const { hostname } = new URL(originalUrl);
  dns.lookup(hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid hostname' });
      return;
    }

    const shortUrl = nextShortUrlId++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'short url not found' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});