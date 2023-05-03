const express = require('express');
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');
const router = express.Router();

router.post('/join-call', (req, res) => {
  const peer = new SimplePeer({ initiator: true, wrtc: wrtc });
  let responseSent = false;
  peer.on('signal', (offer) => {
    if (!responseSent) {
      res.json({ offer });
      responseSent = true;
    }
  });
});

router.post('/answer-call', (req, res) => {
  const peer = new SimplePeer({ wrtc: wrtc });
  let responseSent = false;
  peer.on('signal', (answer) => {
    if (!responseSent) {
      res.json({ answer });
      responseSent = true;
    }
  });

  peer.signal(req.body.offer);
});

router.post('/connect-peers', (req, res) => {
  const peer = new SimplePeer({ wrtc: wrtc });
  const { answer } = req.body;

  peer.on('stream', (stream) => {
    console.log('Received a new stream:', stream.id);
  });

  peer.on('error', (error) => {
    console.error('An error occurred:', error);
  });

  peer.signal(answer);

  res.sendStatus(200);
});

module.exports = router;
