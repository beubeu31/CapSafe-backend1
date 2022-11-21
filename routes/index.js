var express = require("express");
var router = express.Router();
var fetch = require("node-fetch");
// Interrogation de l'API navitia
// router.get("/displayJourney", function (req, res) {
//   const options = {headers: { Authorization: "a3241d36-8169-4f8b-840c-214b769f3771" },}; // clé d'autorisation limité à 5000 requête/jour
//   fetch(`https://api.navitia.io/v1/journeys?from=2.3036095;48.8877713&to=2.655400;48.542107`, options)
//   .then((reponseAPI) => reponseAPI.json().then((reponseAPIJson) => {
//       if (reponseAPIJson.journeys[0].sections) {
//         let test = reponseAPIJson.journeys[0].sections.map((data) => {});
//         res.json({ result: true, journey: test });
//       } else {
//         res.json({ result: false });
//       }
//     })
//   );
// });

module.exports = router;
