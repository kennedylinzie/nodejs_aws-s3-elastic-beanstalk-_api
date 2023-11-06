const express = require("express");
const router = express.Router();

const apiAuthMiddleware = require("../auth/apiAuthMiddleware");
const usersController = require("../controller/aws.controller");

// Apply the API key authentication middleware to the routes that require authentication
router.use(apiAuthMiddleware);

// Define your protected routes

//for use
//headers:apiKey = apikey
//x-www-form-urlencoded

router.post("/getfolderdata/", usersController.getfolderdata);
/*for getfolderdata
-Gets all aploaded data from the bucket from a specific user this gives the file name and the url
to the file and it expires in one hours
url = /api/v1/dyrio/getfolderdata
body: bucketName  = 
      userID   = 
*/

router.post("/getall/", usersController.getAll);
/*for getall
-Gets all aploaded data from the bucket this gives the file name and the url
to the file and it expires in one hours
url = /api/v1/route/getall
body: bucketName  = 
*/

router.post("/fileupload/", usersController.uploadfile);
/*for fileupload
-Uploads a file under a spacific folder if a folder does exist it will create one
url = /api/v1/route/fileupload
body: audio     = jsonfile
*/
router.post("/delete/", usersController.delete);
/*for delete
-if you pass the key only e.g 2344 it will delete everything under that folder
-if you pass the ket and file name it will just take fiel e.g 2344/2344_xxxxxxxxxx.mp3
url = /api/v1/route/delete
body: bucketName
      folderName
*/

module.exports = router;
