var express = require("express");
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { checkBody } = require("../modules/checkBody");

var router = express.Router();
//Pour Theo
// allInfo: {
//   userName: userFoundInDb.userName,
//   firstName: userFoundInDb.firstName,
//   sexe: userFoundInDb.sexe,
//   email: userFoundInDb.email,
//   phoneNumber: userFoundInDb.phoneNumber,
//   address: userFoundInDb.address,
//   favoriteTransportLine: userFoundInDb.favoriteTransportLine,
//   profilPhoto: userFoundInDb.profilPhoto,
//   showProfilPhoto: userFoundInDb.showProfilPhoto,
//   showSexOnProfil: userFoundInDb.showSexOnProfil,
//   registerDate: userFoundInDb.registerDate,
//   emergencyTime: userFoundInDb.emergencyTime,
//   score: userFoundInDb.score }

/* GET users listing. */
router.post("/displayOneUser", function (req, res) {
  User.findOne({ token: req.body.token }).then((userFoundInDb) => {
    if (userFoundInDb) {
      //récupération des données utiles uniquement. Pas de mot de passe en front

      res.json({ result: true, userInfo: userFoundInDb });
    } else {
      res.json({ result: false });
    }
  });
});
router.post("/displayProfil", function (req, res) {
  User.findOne({ token: req.body.token }).then((userFoundInDb) => {
    if (userFoundInDb) {
      //récupération des données utiles uniquement. Pas de mot de passe en front
      res.json({ result: true, userInfo: userFoundInDb });
    } else {
      res.json({ result: false });
    }
  });
});

/* GET users listing. */
router.post("/signUp", function (req, res) {
  User.findOne({ email: req.body.email }).then((userFoundInDb) => {
    if (userFoundInDb) {
      res.json({ result: false, error: "user already exists" });
    } else {
      const newUser = new User({
        // firstName: req.body.firstName,
        // lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        token: uid2(32),
        // phoneNumber:[phoneNumbersSchema],
        // birthdayDate:req.body.,
        // addresses: [addressesSchema],
        sexe: req.body.sexe,
        // favoriteTransportLine: req.body.,
        // profilPhoto:req.body.,
        // travelingWithSameSex: req.body.,
        // showProfilPhoto: req.body.,
        // showSexOnProfil: req.body.,
      });
      newUser.save().then((newUser) => {
        res.json({
          result: true,
          token: newUser.token,
          userName: newUser.userName,
        });
      });
    }
  });
});

router.post("/signIn", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, username: data.username, token: data.token });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

router.post("/update", function (req, res) {
  User.findOne({ token: req.body.token }).then((tokenFoundInDb) => {
    if (tokenFoundInDb) {
      if (req.body.firstname) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { firstname: req.body.firstname }
        ).then();
        res.json({ result: true });
      } else if (req.body.lastname) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { lastname: req.body.lastname },
          { new: true }
        ).then();
        res.json({ result: true });
      } else if (req.body.username) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { username: req.body.username }
        ).then();
        res.json({ result: true });
      } else if (req.body.email) {
        User.updateOne(
          { token: req.body.token },
          { $set: { email: req.body.email } }
        ).then();
        res.json({ result: true });
      } else if (req.body.password) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { password: bcrypt.hashSync(req.body.password, 10) }
        ).then();
        res.json({ result: true });
      } else if (req.body.birthdayDate) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { birthdayDate: req.body.birthdayDate }
        ).then();
        res.json({ result: true });
      } else if (req.body.sexe) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { sexe: req.body.sexe }
        ).then();
        res.json({ result: true });
      } else if (req.body.favoriteTransportLine) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { favoriteTransportLine: req.body.favoriteTransportLine }
        ).then();
        res.json({ result: true });
      } else if (req.body.travelingWithSameSex) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { travelingWithSameSex: req.body.travelingWithSameSex }
        ).then();
        res.json({ result: true });
      } else if (req.body.showProfilPhoto) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { showProfilPhoto: req.body.showProfilPhoto }
        );
        res.json({ result: true });
      } else if (req.body.showSexOnProfil) {
        User.findOneAndUpdate(
          { token: req.body.token },
          { showSexOnProfil: req.body.showSexOnProfil }
        ).then();
        res.json({ result: true });
      } else {
        res.json({ result: false });
      }      
    }
  });
});

router.delete("/delete", function (req, res) {
  User.findOne({ token: req.body.token }).then((tokenFoundInDb) => {
    if (tokenFoundInDb) {
      User.deleteOne({ token: req.body.token }).then((userDeleted) => {
        if (userDeleted.deletedCount > 0) {
          res.json({ result: true });
        } else {
          res.json({ result: false, error: "User cant be deleted" });
        }
      });
    }
  });
});

module.exports = router;
