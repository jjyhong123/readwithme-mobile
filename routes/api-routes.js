const express = require('express');
const multer = require('multer')
const bodyParser = require('body-parser');
const keys = require('../config/keys/keys');
const router = express.Router();
const { Translate } = require('@google-cloud/translate');
const AWS = require('aws-sdk');

AWS.config.logger = console;

AWS.config = new AWS.Config({
  accessKeyId: keys.amazon.accessKeyId,
  region: keys.amazon.region,
  secretAccessKey: keys.amazon.secretAccessKey
});

const rekognition = new AWS.Rekognition({});
const polly = new AWS.Polly.Presigner();
const comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

var testMulter = multer().single("image")

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

  polly.getSynthesizeSpeechUrl(params, [60 * 60 * 24 * 7], (error, url) => {
    if (error) {
      console.log(error.code, error.stack, error)
    }

    else {
      res.render("picture", { user: req.user, src: url, image: imagen, text: texto }) // only to aid with CSS, delete after
    }

    /*
    req.session.obj = { src: url, image: imagen, text: texto }
    res.redirect("/picture") 
    */
    

  });
};

router.post(
  '/add',
  testMulter,
  (req, res) => {
    let image = "data:image/png;base64," + req.file.buffer.toString('base64')
    console.log(image)

    let params = {
      Image: {
        Bytes: req.file.buffer
      }
    }
    rekognition.detectText(params, function(err, data) {
      if (err) return res.render("picture", { user: req.user, image: image, err: "An error occurred." })
      else     {
        if (!data.TextDetections.length) return res.render("picture", { user: req.user, image: image, err: "No text detected in image." })
        let textDetections = data.TextDetections
        let lineDetections = textDetections.filter(detection => detection.Type === "LINE" && detection.Confidence >= 90) 
        let textArray = lineDetections.map(detection => detection.DetectedText)
        let text = textArray.join(' ')
        const handleLanguageDetection = (text) => {
          let params = {
            Text: text
          };
          comprehend.detectDominantLanguage(params, function(err, data) {
            if (err) res.render("picture", { user: req.user, image: image, err: "An error occurred." })
            else     {
              let language = data.Languages[0].LanguageCode
              let speaker = convertLanguageToSpeaker(language)
              handleTextToVoice(speaker, text, image, req, res);
            }           
          });
        }
        handleLanguageDetection(text);
      }          
    });
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