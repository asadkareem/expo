const formidable = require('formidable');
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, S3 } = require("@aws-sdk/client-s3");
const Transform = require('stream').Transform;

const accessKeyId = "AKIAV64CGJACQBLWTT4M";
const secretAccessKey = "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";
const region = "eu-north-1";
const Bucket = "expolearn";

const parseChatImage = async (req) => {
    return new Promise((resolve, reject) => {
        let field;
        let options = {
            maxFileSize: 10737418240,
            allowEmptyFiles: false
        }
        const form = formidable(options);
        // Flag to check if any file is uploaded
        let fileUploaded = false;
        // method accepts the request and a callback.
        form.parse(req, (err, fields, files) => {
            field = fields;
            if (Object.keys(files).length > 0) {
                fileUploaded = true;
            } else {
                resolve(fields);
            }
            console.log(fields, "====", files)
        });
        form.on('error', error => {
            reject(error.message)
        })
        form.on('data', data => {
            if (data.name === "complete") {
                // Let's only resolve when a file is uploaded
                if (fileUploaded) {
                    resolve(data.value);
                }
            }
        })
        form.on('fileBegin', (formName, file) => {
            file.open = async function () {
                this._writeStream = new Transform({
                    transform(chunk, encoding, callback) {
                        callback(null, chunk)
                    }
                })
                this._writeStream.on('error', e => {
                    form.emit('error', e)
                });
                // upload to S3
                new Upload({
                    client: new S3Client({
                        credentials: {
                            accessKeyId,
                            secretAccessKey
                        },
                        region
                    }),
                    params: {
                        ACL: 'public-read',
                        Bucket,
                        ContentType: 'image/png',
                        Key: `${Date.now().toString()}`,
                        Body: this._writeStream
                    },
                    tags: [], // optional tags
                    queueSize: 4, // optional concurrency configuration
                    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
                    leavePartsOnError: false, // optional manually handle dropped parts
                })
                    .done()
                    .then(data => {
                        field.image = data.Location;
                        form.emit('data', { name: "complete", value: field });
                    }).catch((err) => {
                        form.emit('error', err);
                    })
            }
            file.end = function (cb) {
                this._writeStream.on('finish', () => {
                    this.emit('end')
                    cb()
                })
                this._writeStream.end()
            }
        })
    })
}


module.exports = parseChatImage;
