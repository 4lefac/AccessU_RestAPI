const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();
var entrances = new Array();
var entrancesRef = db.collection('entrances');
/*
 * get request
 */
router.get('/', (req, res, next) => {
    entrancesRef.orderBy('name').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
            var tempEntrance = doc.data();
            tempEntrance.id = doc.id;
            entrances.push(tempEntrance);
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
    //entrances = getAllEntrances();
    res.status(200).json(entrances);
    entrances = [];
});

/*
 * return a certain id to the user
 */
router.get('/:entranceID', (req, res, next) => {
    entrancesRef.doc(req.params.entranceID).get()
        .then(doc => {
            if (!doc.exists) {
                res.status(200).json({
                    message: 'No Such Document',
                });
            } else {
                var tempEntrance = doc.data();
                tempEntrance.id = doc.id;
                res.status(200).json(tempEntrance);
            }
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});

/*
 * post request
 */
router.post('/', (req,res,next)=>{
    //getting the entrance made from the user
    const entrance = {
        name: req.body.name,
        coordinates : new admin.firestore.GeoPoint(
            req.body.coordinates.latitude, req.body.coordinates.longitude),
        description: req.body.description,
        accessibilityType: req.body.accessibilityType
    }
    //adding the entrance to the database
    entrancesRef.add(entrance).then(ref => {
        res.status(200).json({
            message: 'Successfully added document',
            id: ref.id
        });
      });
});

module.exports = router;