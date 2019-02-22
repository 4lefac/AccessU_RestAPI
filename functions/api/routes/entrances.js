const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

function getAllEntrances(){
    db.collection('entrances').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
}

/*
 * get request
 */

router.get('/', (req, res, next) => {
    console.log('requiest sent');
    getAllEntrances();
    res.status(200).json({message:' Request Successful',
    });
});

router.get('/:entranceID', (req, res, next) => {
    const id = req.params.entranceID;
    if (id === 'special'){
        res.status(200).json({
            message: 'You discovered the special id',
            id: id
        });  
    } else {
        res.status(200).json({
            message: 'you passed an ID',
            id: id
        });
    }
});

/*
 * post request
 */
router.post('/', (req,res,next)=>{
    //getting the entrance made from the user
    const entrance = {
        name: req.body.name,
    }
    res.status(200).json({
        message: 'Handling post Request to /entrances',
        createEntrance: entrance
    });
});


/*
 * delete request
 */
router.delete('/:entranceID', (req, res, next) => {
    const id = req.params.entranceID;
    res.status(200).json({
        message: 'you deleted an ID',
        id: id
    });

});

module.exports = router;