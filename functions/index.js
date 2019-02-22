const functions = require('firebase-functions');
const express = require('express');
const entranceRoutes = require('./api/routes/entrances');

const app = express();
/*
 * 
 */
app.use('/entrances', entranceRoutes);


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

exports.app = functions.https.onRequest(app);
