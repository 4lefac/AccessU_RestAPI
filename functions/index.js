const functions = require('firebase-functions');
const admin = require('firebase-admin');

//initializing app here so you dont have to do it any where else
//const firebase = admin.initializeApp(functions.config().firebase);
var serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const express = require('express');
const locationsRoutesV2 = require('./api/v2/routes/locations');
const imagesRoutesV2 = require('./api/v2/routes/images');
const app = express();
/*
 * 
 */
app.use('/api/v2', locationsRoutesV2);

app.use('/api/v2/images', imagesRoutesV2);
/*
 * handle error if api is called incorectly
 */
app.use((req,res,next)=>{
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

/*
 * handle errors thrown by node itself
 */
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});
//managing rest endpoint calls
exports.app = functions.https.onRequest(app);
