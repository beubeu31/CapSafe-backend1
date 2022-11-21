var express = require("express");
var router = express.Router();
const Message = require("../models/message");

const Pusher = require("pusher");
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");
const User = require("../models/users");

router.post("/displayConversations", (req, res) => {
  let token2 = [];
  var retourBDD = [];

  Message.find({
    $or: [{ token: req.body.token }, { token2: req.body.token }],
  }).then((conversationFoundInDb) => {
    if (conversationFoundInDb) {
      conversationFoundInDb.map((conversation, i) => {
        if (conversation.token1 === req.body.token) {
          retourBDD.push({
            token1: conversation.token1,
            token2: conversation.token2,
            lastMessage:
              conversation.messageContent[conversation.messageContent.length - 1],
          });
          token2.push(conversation.token2);
        } else {
          token2.push(conversation.token1);
          retourBDD.push({
            token1: conversation.token2,
            token2: conversation.token1,
            lastMessage:
              conversation.messageContent[
                conversation.messageContent.length - 1
              ],
          });
        }
      });
      token2.map((token, i) => {
        User.findOne({ token: token }).then((userFoundInDb) => {
          retourBDD[i].username = userFoundInDb.username;
          if (userFoundInDb) {
            if (userFoundInDb.showProfilPhoto) {
              retourBDD[i].profilPhoto = userFoundInDb.profilPhoto;
            } else if (!userFoundInDb.showProfilPhoto) {
              retourBDD[i].profilPhoto = false;
            }
            if (token2.length - 1 === i) {
              res.json({ result: true, retour: retourBDD });
            }
          } else {
            res.json({ result: false, error: "no user found" });
          }
        });
      });
    }
  });
});

router.post("/displayMessages", (req, res) => {
  User.findOne({ token: req.body.token }).then((userInDb) => {
    if (userInDb) {
      let possibleChannel1 = req.body.token + req.body.token2;
      let possibleChannel2 = req.body.token2 + req.body.token;
      Message.find({
        $or: [{ chanel: possibleChannel1 }, { chanel: possibleChannel2 }],
      }).then((messageFoundInDb) => {
        if (messageFoundInDb) {
          let retourBack = [];
          messageFoundInDb.map((data, i) => {
            retourBack.push({
              message: data.messageContent,
              channel: data.chanel,
            });
          });
          res.json({
            result: true,
            channel: messageFoundInDb.chanel,
            message: retourBack,
          });
        } else {
          res.json({ result: false, error: "no message" });
        }
      });
    } else {
      res.json({ result: false, error: "user doesnt exist in db" });
    }
  });
});
// Pusher permet de mettre en relation 2 utilisateurs via un tunnel(chanel) qui leur permet d'échanger en instantanné tant que ceux ci ne quitte pas le tunnel(channel)
// Si l'un des utilisateur quitte le channel puis revient dessus les messages auront disparu appart si ceux ci ne sont sauvgardé en bdd. Pusher ne conserve pas les messages comme une bdd.
// On peux envoyer toute les informations que l'on souhaite en Params à Pusher afin de les réupérer ds la console Pusher.
// Mise à jour (route PUT) du channel (chat) existant en ajoutant (join) un utilisateur (: username)

router.put("/users", (req, res) => {
  // connection au channel via le params token demandé pair Pusher
  pusher.trigger(req.body.chanel, "join", { token: req.body.token }); //'chat' Nom du chanel, 'join' Evenement, 'username' condition demandé par Pusher
  res.json({ result: true });
});

// Suppression (route DELETE) de l'utilisateur (: username) du channel (chat) l'orsqu'il le quitte (leave)
router.delete("/users", (req, res) => {
  //Déconnection du channel via le params token
  pusher.trigger(req.body.chanel, "leave", { token: req.body.token }); //'chat' Nom du chanel, 'leave' Evenement, 'token' / ceux sont des paramètres
  res.json({ result: true });
});

router.post("/message", async (req, res) => {// je reçois du contenu du front
  const message = req.body; // contenu
  let channel = "";
  let possibleChannel1 = req.body.token + req.body.token2;
  let possibleChannel2 = req.body.token2 + req.body.token;
  Message.findOne({
    $or: [{ chanel: possibleChannel1 }, { chanel: possibleChannel2 }],
  }).then((channelExists) => {
    if (channelExists !== null) {
      pusher.trigger(channelExists.chanel, "message", message);//push message dans le channel existant
      Message.findOneAndUpdate(
        { chanel: channelExists.chanel },
        {$push: {messageContent: { message: message.message }, },}
      ).then((data) => {
        channel = data.chanel;
        res.json({ result: true, action: "push dans le channel existant" });
      });
    } else {
      const newMessage = new Message({
        token1: message.token,
        token2: message.token2,
        chanel: possibleChannel1,
        messageContent: [{
            message: message.message,
            timestamp: message.timestamp,
            sended: true,
        }],
      });
      pusher.trigger(possibleChannel1, "message", message);
      newMessage.save().then((messageSent) => {
        if (messageSent) {
          res.json({ result: true, action: "création dans nouveau channel" });
        } else {
          res.json({ result: false });
        }
      });
    }
  });
});

module.exports = router;
