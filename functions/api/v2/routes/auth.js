const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

//Request for user verification given UID
router.param('uid', (req, res, next, uid) => {

  //Check if user is registered
  admin.auth().getUser(uid)
  .then(function(userRecord) {
    if(userRecord.emailVerified){
      res.send(true);
    }
  })
  .catch(function(error) {
    console.log('Error fetching user data:', error);
  });
});
