require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {};
let idCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({
      error: 'No short URL found'
    })
  }
})

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  const urlRegex = /^(https?:\/\/)(www\.)?([\w.-]+\.[a-z]{2,6})(\/.*)?$/i;
  const match = url.match(urlRegex);

  if (!match) {
    return res.json({ error: 'invalid url' });
  }
  const hostname = match[3];
  dns.lookup(hostname, (err) => {
    if (err) {
      res.json(
        {
          error: 'invalid url'
        }
      )
    } else {
      const shortUrl = idCounter;
      idCounter += 1;
      urlDatabase[shortUrl] = url;

      res.json({
        original_url: url, short_url: shortUrl
      })
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
