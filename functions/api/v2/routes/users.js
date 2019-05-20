const functions = require('firebase-functions');
const firebase = require("firebase/app");
const admin = require('firebase-admin');
const webAuth = require('firebase/auth');
const express = require('express');
const router = express.Router();

//Admin Auth
const auth = admin.auth();

//Sign up POST request
router.post('/signUp', (req, res, next) => {
    //Create Object for user
    const user = {
        email : req.body.email,
        password : req.body.password,
        firstName : req.body.first,
        lastName : req.body.last
    }

    //Create User
    auth.createUser({
        email: user.email,
        emailVerified: true,
        password: user.password,
        displayName: user.firstName + ' ' + user.lastName,
        disabled: false
      })
        .then(function(userRecord) {
          console.log('Successfully created new user:', userRecord.uid);
          res.send('Successful');
        })
        .catch(function(error) {
          console.log('Error creating new user:', error);
          res.json({
              errorCode : error.code,
              errorMessage : error.message
          });
        });
    /*
    auth.createUserWithEmailAndPassword(user.email, user.password).then(function() {
        res.send('Successful');
    }).catch(function(error){
        var errorCode = error.code;
        var errorMessage = error.message;
        res.send('ERROR: ' + errorCode + ' : ' + errorMessage); // Make this Json
    });
    */
});

//Sign in POST request
router.post('/signIn', (req, res, next) => {
    //Create object of user
    const user = {
        email : req.body.email,
        password : req.body.password
    }

    //Sign in user
    webAuth.signInUserWithEmailAndPassword(user.email, user.password).then(function() {
        res.send('Successful');
    }).catch(function(error){
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('ERROR: ' + errorCode + ' : ' + errorMessage);
        res.send('Failed');
    });
});

//Request for user verification given UID
router.post('/auth', (req, res, next) => {
    var uid = req.body.uid;
  
    //Check if user is registered
    auth.getUser(uid)
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
