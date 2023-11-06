const {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const CryptoJS = require("crypto-js");

const s3Client = new S3Client({
  region: process.env.AWS_REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const usersController = {
  getfolderdata: async (req, res) => {
    const bucketName = req.body.bucketName; // Assuming you pass the bucket name as a URL parameter
    const StudyCode = req.body.userid; // Assuming you pass the folder name as a URL parameter

    try {
      const listParams = {
        Bucket: bucketName,
        Prefix: userid + "/",
      };

      const listCommand = new ListObjectsCommand(listParams);
      const listedObjects = await s3Client.send(listCommand);

      //create a signed url from the client credentials and gives it as a direct encrypted url that expires
      const filesWithPresignedUrls = await Promise.all(
        listedObjects.Contents.map(async (obj) => {
          const getObjectCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: obj.Key,
          });
          const url = await getSignedUrl(s3Client, getObjectCommand, {
            expiresIn: 3600,
          });

          return {
            filename: obj.Key,
            url: url,
          };
        })
      );

      res.json({
        files: filesWithPresignedUrls,
        count: filesWithPresignedUrls.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while listing files in the folder.",
      });
    }
  },
  getAll: async (req, res) => {
    const bucketName = req.body.bucketName; // Assuming you pass the bucket name as a URL parameter

    try {
      const listParams = {
        Bucket: bucketName,
      };

      const listCommand = new ListObjectsCommand(listParams);
      const listedObjects = await s3Client.send(listCommand);
      //creates a signed url from the client credentials and gives it as a direct encrypted url that expires
      const filesWithPresignedUrls = await Promise.all(
        listedObjects.Contents.map(async (obj) => {
          const getObjectCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: obj.Key,
          });
          const url = await getSignedUrl(s3Client, getObjectCommand, {
            expiresIn: 3600,
          });

          return {
            filename: obj.Key,
            url: url,
          };
        })
      );

      res.json({
        files: filesWithPresignedUrls,
        count: filesWithPresignedUrls.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while listing files.",
      });
    }
  },
  delete: async (req, res) => {
    const bucketName = req.body.bucketName;
    const folderName = req.body.folderName;

    try {
      const listParams = {
        Bucket: bucketName,
        Prefix: folderName, // The folder's name you want to delete
      };

      const listCommand = new ListObjectsCommand(listParams);
      const listedObjects = await s3Client.send(listCommand);

      if (listedObjects.Contents.length === 0) {
        console.log("Folder doesn't exist.");
        res.json({
          status: "Folder doesn't exist.",
        });
        return;
      }

      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key })),
          Quiet: false,
        },
      };

      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      await s3Client.send(deleteCommand);
      res.json({
        status: "deletion success",
      });
    } catch (error) {
      // console.log(error)
      res.json({
        status: "error",
      });
    }
  },
  uploadfile: async (req, res) => {
    const data = JSON.parse(req.body.audio);

    let errors = [];

    // Access and loop through prompts array
    for (const prompt of data.prompts) {
        try {
       

            // Loop through answers for the current prompt
            for (let index = 0; index < prompt.answers.length; index++) {
                const answer = prompt.answers[index];
                try {
                    const decryptedData = await decryptData(
                        answer,
                        process.env.ENC_KEY,
                        process.env.INIT_VECTOR
                    );
                    // Decrypt and upload logic
                    const audioBuffer = Buffer.from(decryptedData, "base64");
                    const fileName = `${data.study_code}/${data.date}/prompt_${prompt.id}answer_${index}.mp3`;

                    const uploadParams = {
                        Bucket: process.env.AWS_BUCKET,
                        Key: fileName,
                        Body: audioBuffer,
                    };

                    await s3Client.send(new PutObjectCommand(uploadParams));

                } catch (error) {
                    console.error(error);
                    errors.push(error);
                }
            }
        } catch (error) {
            console.error(error);
            errors.push(error);
        }
    }

    if (errors.length === 0) {
        res.json({
            status: "success",
        });
    } else {
        res.json({
            status: "error",
            errors: errors,
        });
    }
  },
};

async function decryptData(data_, key_, iv_) {
  var encrypted = data_;
  var key = CryptoJS.enc.Utf8.parse(key_);
  var iv = CryptoJS.enc.Utf8.parse(iv_);
  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
  });
  //console.log(decrypted.toString(CryptoJS.enc.Utf8));
  return decrypted.toString(CryptoJS.enc.Utf8);
}
module.exports = usersController;
