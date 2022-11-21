var express = require("express");
const Ligne = require("../models/lignes");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { checkBody } = require("../modules/checkBody");
var router = express.Router();

/* GET users listing. */
router.post("/addStation", function (req, res) {
  Ligne.findOne({ gare: req.body.gare }).then((userFoundInDb) => {
    if (userFoundInDb) {
      res.json({ result: false, error: "Station already exists" });
    } else {
      const newLigne = new Ligne({        
        gare: req.body.gare,
        ligne: "RER_A",        
      });
      newLigne.save().then(() => {
        res.json({
          result: true,
        });
      });
    }
  });
});

router.get("/checkCity/:city", function (req, res) {
  Ligne.find({ gare: { $regex: "^" + req.params.city, $options: "gi" } })
    .limit(5)
    .then((stationFound) => {
      if (stationFound) {
        console.log(stationFound[0].gare);
        res.json({ result: true, return: stationFound });
      } else {
        res.json({ result: false, error: "Station already exists" });
      }
    });
});

module.exports = router;
