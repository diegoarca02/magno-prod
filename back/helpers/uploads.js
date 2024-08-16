const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');


const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  credentials: {
    accessKeyId: 'DO002BNLFARRH3CMYE8F',
    secretAccessKey: 'P4mSh10XpszMJiKTHbG74kQ+fDN+jJzYUpCbIsAf9YA'
  }
}); 

const upload = (dir) => multer({

    storage: multerS3({
        s3,
        bucket: 'ooneunion-resources',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE, //
        metadata: (req, file, cb) => {
            cb(null, {
                fieldName: file.fieldname,
            });
        },
        key: (request, file, cb) => {
            console.log(file);
            let extArray = file.originalname.split(".");
            cb(null, dir + '/' + Date.now() + '-' + file.originalname);
        },
        contentDisposition: 'inline',
    }),
}).array('files[]');


module.exports = upload;