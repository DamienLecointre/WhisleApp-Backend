var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/cities", (req, res) => {
  const url =
    "https://api.geoapify.com/v2/places?categories=populated_place.city,populated_place.town&filter=circle:7.353380491132475,48.22567345743173,50000&limit=5&apiKey=5177dfa5e2bf468798eb55db516a885a";

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      for (let i = 0; i < data.features.length; i++) {
        res.json(data.features[i].properties.city);
      }
    });
});

module.exports = router;
