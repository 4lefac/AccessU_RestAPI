/*
 * Setting up variables
 */
const express = require('express');
const router = express.Router();
const os = require('os');
const path = require('path');
const Busboy = require('busboy');
const fs = require('fs');
const defaultBucketName = ('accessu-c0933.appspot.com');
const admin = require("firebase-admin");
const gcs = admin.storage();
const bucket = gcs.bucket(defaultBucketName);
var db = admin.firestore();
var entrancesRef = db.collection('entrances');
var locationsRef = db.collection('locations');

/*
 * The purpose of this promise is to check if the image name is valid object in either one of our collections (locations or entrances).
 * WIll resolve to true if the file exist or it will reject and send an error if it does not exist.
 */
function check (id, collection){
    return new Promise((resolve,reject) => {
    /*
    *  getting the location id and if the location id cant be found then send an error to the user
    */ 
   if(collection === 'locations'){
        locationsRef.doc(id).get().then(doc => {
            if (!doc.exists) {
                reject("file not found, please make sure location id is correct");
            } else {
                resolve(true);
            }
        })
        .catch((err) => {
            reject(err)
        });
    } 
    else {
        entrancesRef.doc(id).get().then(doc => {
            if (!doc.exists) {
                reject("file not found, please make sure entrance id is correct");
            } else {
                resolve(true);
            }
        })
        .catch((err) => {
            reject(err)
        });
    }
    })
}

/*
 * promise adds the file to the database and sends download url back
 */
function add (imageName, req){
    return new Promise((resolve, reject) => {
            //busboy allows us the parse the form data
    const busboy = new Busboy({ headers: req.headers });
    let uploadData = null;

    /*
    * getting file from the api call
    */
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        const filepath = path.join(os.tmpdir(), filename);
        uploadData = { file: filepath, type: mimetype };
        //actually storing the file in a temporary folder. whenver a file is downloaded it goes to a temporary location
        file.pipe(fs.createWriteStream(filepath));
    });

    /*
    * uploading to the server
    */
    busboy.on("finish", () => {
        //once parse we upload it to the initialized google cloud storage package
        bucket.upload(uploadData.file, {
            uploadType: "media",
            metadata: {
                metadata: {
                    contentType: uploadData.type
                }
            },
            destination: ('/images/' + imageName)
        }).then((data) => {
            //getting the image URL
            let file = data[0];
            file.getSignedUrl({action: 'read', expires: '03-09-2491'}).then(urls => {
                const signedUrl = urls[0];
                resolve(signedUrl);
            }).catch (err => {
                reject(err);
            })
        }).catch(err => {
            reject(err);
        });
    });
    //ending the process
    busboy.end(req.rawBody);
    })
}

/*
 * updates the imageUrl property for the entrance or location with the sepcidic id. collections can be locations or entrances
 */
function updateUrl(id, collection, signedUrl){
    return new Promise ((resovle, reject) => {
        if(collection === 'locations'){       
        locationsRef.doc(id).update({
            imageUri: signedUrl
        }).catch((err) => {
            reject(err);
        })
        } else {
            entrancesRef.doc(id).update({
                imageUri: signedUrl
            }).catch((err) => {
                reject(err);
            })
        }
    })
}

router.post('/location/:imageName', (req, res, next) => {
    //image name
    var name = req.params.imageName;

    //check if image name is correct and if it is correct then add it to hte file and send a response to the user.
    check(name, 'locations').then(() => {
        return add(name,req);
    }).then((signedUrl) => {
        updateUrl(name,'locations', signedUrl)
    }).then(() => {
        res.status(200).send('success');
    }).catch((err) => {
        res.status(200).json({
            message: 'error here',
            error: err
        })
    })
});

router.post('/entrance/:imageName', (req, res, next) => {
    //image name
    var name = req.params.imageName;

    //check if image name is correct and if it is correct then add it to hte file and send a response to the user.
    check(name, 'entrances').then(() => {
        return add(name,req);
    }).then((signedUrl) => {
        updateUrl(name,'entrances', signedUrl)
    }).then(() => {
        res.status(200).send('success');
    }).catch((err) => {
        res.status(200).json({
            message: 'error here',
            error: err
        })
    })
});
module.exports  = router;