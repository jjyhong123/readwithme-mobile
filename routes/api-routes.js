const express = require('express');
const multer = require('multer')
const multerS3 = require("multer-s3")
const bodyParser = require('body-parser');
const keys = require('../config/keys/keys');
const router = express.Router();

// GOOGLE STUFF
'use strict';

const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate');

// Creates a client (FIX ROUTE?)
const client = new vision.ImageAnnotatorClient(
  { keyFilename: keys.google.applicationCredentials }
);
// END OF GOOGLE STUFF

// AMAZON STUFF
const AWS = require('aws-sdk');

AWS.config.logger = console;

AWS.config = new AWS.Config({
  accessKeyId: keys.amazon.accessKeyId,
  region: keys.amazon.region,
  secretAccessKey: keys.amazon.secretAccessKey
});

//AWS.region = "us-west-2"
var rekognition = new AWS.Rekognition({});//

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'read-with-me-bucket',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

const singleUpload = upload.single("image")

const convertLanguageToSpeaker = (language) => {
  const languageSpeakers = { 'zh': 'Zhiyu', 'da': 'Naja', 'nl': 'Lotte', 'en': 'Joanna', 'fr': 'Celine', 'de': 'Marlene', 'hi': 'Aditi', 'is': 'Dora', 'it': 'Carla', 'ja': 'Mizuki', 'ko': 'Seoyeon', 'no': 'Liv', 'pl': 'Ewa', 'pt': 'Ines', 'ro': 'Carmen', 'ru': 'Tatyana', 'es': 'Lucia', 'sv': 'Astrid', 'tr': 'Filiz' }
  return languageSpeakers[language]
}

const handleTextToVoice = (hablante, texto, imagen, req, res) => {
  const { url, ...params } = {
    OutputFormat: "mp3",
    Text: texto,
    TextType: "text",
    VoiceId: hablante,
    url: null
  };

  const polly = new AWS.Polly.Presigner();
  polly.getSynthesizeSpeechUrl(params, [60 * 60 * 24 * 7], (error, url) => {
    if (error) {
      console.log(error.code, error.stack, error)
    }
    res.render("picture", { user: req.user, src: url, image: imagen, text: texto })

  });
};

const Polly = () => {
  return new AWS.Polly({ apiVersion: '2016-06-10' })
}

// END OF AMAZON STUFF

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

// ----START OF ROUTES---- //
var testMulter = multer().single("image")

router.post(
  '/add',
  testMulter,
  //singleUpload,
  (req, res) => {

    let params = {
      Image: {
        Bytes: req.file.buffer
      }
    }

    rekognition.detectText(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     {
        let textDetections = data.TextDetections
        const lineDetections = textDetections.filter(detection => detection.Type === "LINE" && detection.Confidence >= 90) 
        const textArray = lineDetections.map(detection => detection.DetectedText)
        const text = textArray.join(' ')
        console.log(text)
        handleTextToVoice("Joanna", text, null, req, res);
      }          
    });

    /*
    client
    .textDetection(req.file.location)
    .then(results => {
      console.log(results)
      let detections = results[0].textAnnotations[0];
      if (detections) {
        console.log(detections)
        let language = detections.locale;
        let text = detections.description.replace(new RegExp('\\n', 'g'), ' ')
        let image = req.file.location;
        let speaker = convertLanguageToSpeaker(language);
        handleTextToVoice(speaker, text, image, req, res);
      } else {
        res.render("picture", { user: req.user, err: "No text detected in image." })
      }
    })
    .catch(err => {
      console.error('ERROR:', err);
      console.log("Help me")
    });
    */
    
  }
);

router.post('/translate', (req, res) => {

  // Creates a client
  const translate = new Translate({ keyFilename: keys.google.applicationCredentials });

  const text = req.body.text;
  const targetLang = req.body.targetLang;
  const image = req.body.image;
  const options = { to: targetLang };

  translate
    .translate(text, options)
    .then(results => {
      let translatedText = results[0];

      let speaker = convertLanguageToSpeaker(targetLang);
      handleTextToVoice(speaker, translatedText, image, req, res);

    })
    .catch(err => {
      console.error('ERROR:', err);
    });

})

module.exports = router;