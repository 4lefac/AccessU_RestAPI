const functions = require('firebase-functions');
const admin = require('firebase-admin');
const auth = require('firebase/auth');
const express = require('express');
const router = express.Router();

//Request for user verification given UID
router.param('/uid', (req, res, next) => {
  var uid = req.body.uid;

  //Check if user is registered
  admin.auth().getUser(uid)
  .then(function(userRecord) {
    if(userRecord.emailVerified){
      res.send(true);
    }
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
    res.send(false);
  });
});
