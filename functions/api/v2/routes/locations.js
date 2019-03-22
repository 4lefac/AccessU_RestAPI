const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

//getting the DB reference
var db = admin.firestore();
var entrances = new Array();
var entrancesRef = db.collection('entrances');
var locationsRef = db.collection('locations');

var defaultImageUri = 'https://firebasestorage.googleapis.com/v0/b/accessu-c0933.appspot.com/o/images%2Fdefault.png?alt=media&token=72eab544-1d73-48fd-9a0b-8d952f504dbc';
/*
 * get request for all the entrances entrances
 */
router.get('/entrances', (req, res, next) => {
    //getting all the entrances and adding them to a json var then return it
    entrancesRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
            var tempEntrance = doc.data();
            tempEntrance.id = doc.id;
            entrances.push(tempEntrance);
        });
    }).then(() => {
        res.status(200).json(entrances);
    })
    .catch((err) => {
        res.status(400).json({
            message: "error getting entraces from server",
            error: err,
        });
    });
});

router.get('/locations', (req, res, next) => {
    var locationsMap = new Map();
    //getting all the locations and adding them to a map
    locationsRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
            var tempLocation = doc.data();
            tempLocation.id = doc.id;
            tempLocation.entrances = [];
            locationsMap.set(tempLocation.id, tempLocation);
        });
    }).then(() => {
        //getting all the entrances and adding them to the respective locations map json
        entrancesRef.get().then((snapshot) => {
            snapshot.forEach((doc) => {
                var tempEntrance = doc.data();
                tempEntrance.id = doc.id;
                var tempLocation = locationsMap.get(tempEntrance.locationID);
                tempLocation.entrances.push(tempEntrance);
                //console.log(tempLocation.entrances.json);
                locationsMap.set(tempEntrance.locationID, tempLocation);
            });
        }).then(() => {
            //getting the locations in json format and returning it to the user
            var result = [];
            for (var value of locationsMap.values()) {
                result.push(value);
              }
              
              console.log(result);
            res.status(200).json(result);
        })
        .catch((err) => {
            res.status(404).json({
                message: "error getting entrances from server",
                error: err,
            });
        });
    })
    .catch((err) => {
        res.status(404).json({
            message: "error getting locations from server",
            error: err,
        });
    });
});

//get entrance with specific id
router.get('/entrances/:entranceID', (req, res, next) => {
    //getting specific location
    entrancesRef.doc(req.params.entranceID).get()
        .then(doc => {
            if (!doc.exists) {
                //404 meaning that the file was not found
                res.status(404).json({
                    message: 'No Such Document',
                    error: 'document not found'
                });
            } else {
                var tempEntrance = doc.data();
                tempEntrance.id = doc.id;
                res.status(200).json(tempEntrance);
            }
    })
    .catch((err) => {
        res.status(400).json({
            message: "Error getting entrance data",
            error : err
        })
    });
});
router.get('/locations/:locationID', (req, res, next) => {
    var tempLocation = [];
    var entrances = [];
    //getting the location
    locationsRef.doc(req.params.locationID).get()
        .then(doc => {
            if (!doc.exists) {
                //404 meaning that the file was not found
                res.status(404).json({
                    message: 'No Such Document',
                });
            } else {
                tempLocation = doc.data();
                tempLocation.id = doc.id;
                //res.status(200).json(tempLocation);
            }
    }).then(() => {
        //adding entrance data to the location
        entrancesRef.where("locationID", "==", req.params.locationID).get().then((snapshot) => {
            snapshot.forEach((doc) => {
                console.log('successfully got document');
                var tempEntrance = doc.data();
                tempEntrance.id = doc.id;
                entrances.push(tempEntrance);
                //console.log(tempEntrance);
            });
        }).then(() => {
            tempLocation.entrances = entrances;
            res.status(200).json(tempLocation);
        })
        .catch((err) => {
            res.status(400).json({
                message: "Error getting entrance data",
                error : err
            })
        });   
    })
    .catch((err) => {
        res.status(400).json({
            message: "Error getting location data",
            error : err
        })
    });
});


/*
 * post request
 */
router.post('/entrance', (req,res,next)=>{
    //getting the entrance made from the user
    //one entrance at a time
    const entrance = {
        direction: req.body.direction,
        coordinates : new admin.firestore.GeoPoint(
            req.body.coordinates.latitude, req.body.coordinates.longitude),
        imageUri : defaultImageUri,
        accessibilityType: req.body.accessibilityType,
        locationID: req.body.locationID,
    }
    locationsRef.doc(entrance.locationID).get()
        .then(doc => {
            //checking if doc exist and if not add entrance
            if (!doc.exists) {
                //404 meaning that the file was not found
                res.status(404).json({
                    message: 'locationID is incorrect',
                    error: 'file does not exist'
                });
            }  else {
                //adding entranceRef to firebase database
                entrancesRef.add(entrance).then(ref => {
                    res.status(200).json({
                        success: 'Successfully added document',
                        id: ref.id
                    });
                })
                .catch((err) => {
                res.status(404).json({
                    message: "error adding the entrance",
                    error : err,
                })
                console.log('Error getting documents', err);
                });
            }
    })
    .catch((err) => {
        res.status(404).json({
            message : "error getting location reference",
            error : err
        })
    });
});

/*
 * post request to locations
 */
router.post('/location', (req,res)=>{
    //getting the location made from the user
    const location = {
        description: req.body.description,
        coordinates : new admin.firestore.GeoPoint(
            req.body.coordinates.latitude, req.body.coordinates.longitude),
        imageUri : defaultImageUri,
        keywords: req.body.keywords,
        name: req.body.name
    }
    //adding the location to the database
    locationsRef.add(location).then(ref => {
        res.status(200).json({
            message: 'Successfully added document',
            id: ref.id
        });
      }).catch((err) => {
        res.status(404).json({
            message: "error adding the location",
            error : err,
        })
     });
});

module.exports = router;