const express = require('express');
const router = express.Router();
const os = require('os');
const path = require('path');

//for handling the files
const Busboy = require('busboy');
const fs = require('fs');

//can be found on the storage website
const defaultBucketName = ('accessu-c0933.appspot.com');
const admin = require("firebase-admin");

//storage stuff
const gcs = admin.storage();
const bucket = gcs.bucket(defaultBucketName);

//getting the DB reference
var db = admin.firestore();
var entrances = new Array();
var entrancesRef = db.collection('entrances');
var locationsRef = db.collection('locations');

//check if image name is correct. If the image name is correct then it will add it to the file.
function checkIfImageNameIsCorrectLocation(name,req,res){
    var ans = true;
    locationsRef.doc(name).get()
    .then(doc => {
            //checking if doc exist
            console.log('checked');
        if (!doc.exists) {
            ans = false;
        }
    }).then(() => {
        //if exist add the file else send a message saying it doesn't exist
        if(ans){
            addFile(name, req, res);
        } else {
            res.status(400).json({
                message : "invalid id, please double check",
            })
        }
    })
    .catch((err) => {
        res.status(400).json({
            message : "error getting location reference",
            error : err
        })
    });
}

function addFile (imageName, req, res){
    //busboy allows us the parse the form data
    const busboy = new Busboy({ headers: req.headers });
    let uploadData = null;
    //parsing a file
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        const filepath = path.join(os.tmpdir(), filename);
        uploadData = { file: filepath, type: mimetype };
  //actually storing the file in a temporary folder. whenver a file is downloaded it goes to a temporary location
    file.pipe(fs.createWriteStream(filepath));
    });

    //uupload to the server
    busboy.on("finish", () => {
        //once parse we upload it to the initialized google cloud storage package
        console.log(uploadData.file);
        bucket
        .upload(uploadData.file, {
            uploadType: "media",
            metadata: {
                metadata: {
                    contentType: uploadData.type
                }
            },
            destination: ('/images/' + imageName)
        })
        .then((data) => {
            //getting the image URL
            let file = data[0];
            file.getSignedUrl({action: 'read', expires: '03-09-2491'}).then(urls => {
                const signedUrl = urls[0];
                console.log(signedUrl);
            }).catch (err => {
                console.log(err);
            })
        }).then(() => {
            //sending to the user it worked
            res.status(200).json({
                message: "It worked!"
            });
        })
        .catch(err => {
            res.status(500).json({
            error: err
            });
        });
    });
    //ending the process
    busboy.end(req.rawBody);
}

router.post('/location/:imageName', (req, res, next) => {
    //image name
    var name = req.params.imageName;

    //check if image name is correct and if it is correct then add it to hte file and send a response to the user.
    checkIfImageNameIsCorrectLocation(name,req,res);
});
module.exports  = router;