# AccessU_RestAPI

## Base URL = https://accessu-c0933.firebaseapp.com/api/v1

## Get Request:
  
  #### "baseUrl/locations/entranceIDHere"
    This will get you the entrance data with that id json back

  #### "baseUrl/locations"
    This will get all locations the data back

  #### "baseUrl/entrances/entranceIDHere"
    This will get you the entrance data with that id json back

  #### "baseUrl/entrances"
    This will get all the data back
    
## Post Request:
  
  #### "baseUrl/location"
    provide a location json to add to the database and you will get back the location id.
    image will be set to default till you update it.

  #### "baseUrl/location"
    provide a entrance json to add to the database and you will get back the entrance id.
    image will be set to default till you update it
  
  #### "baseUrl/images/locations/locationIDHere"
    This will save the image to the database and upadte the url for that specific locationID. file name does not matter
    and the database will do all the work.
    
    The body or content type has to be "form-data" and you have to provide an image!
    
  #### "baseUrl/images/entrances/entranceIDHere"
    This will save the image to the database and upadte the url for that specific entranceID. file name does not matter
    and the database will do all the work.
    
    The body or content type has to be "form-data" and you have to provide an image!
    
## Sample jsons
  ## Entrance json
  {
    "direction":"sw",
    "locationID":"YTVLytSk3d3wmrajApKa",
    "accessibilityTypes":["event space"],
    "coordinates":{"_latitude":39.997708,"_longitude":-83.008036},
    "imageUri":"url here"
  }
  ## Location json
  {
    "keywords": [
        "Ramp accessible",
        "Power door"
    ],
    "name": "Baker Hall West",
    "description": "This is a interesting location to be.",
    "coordinates": {
        "_latitude": 39.9966,
        "_longitude": -83.0107
    },
    "imageUri": "default url unless image is updated through post request of image",
    "id": "psnDpb1YYHgrHQIM7hTU",
    "entrances": [/*entrances objects will go here as seen from entrances json examples *\]
   }
  ## success json
    this will vary on what your posting to the database but most of the time you will a success and a message.
    {
      success: "some message"
      id: "sometimes you will get this back if you made a post request and added something to the database like an entrace"
   }
  ## error json
   {
  
      error: "err posted here:
      message: "message from me"
      
   }
   


    
