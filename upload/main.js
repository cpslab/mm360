'use strict';

const s3 = require('s3');
const AWS_ACCESS_KEY = "AKIAJLVSECTVFSHSBTLA";
const AWS_SECRET_KEY = "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";
// const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
// const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;


const client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
});

function upload() {
    const params = {
        localFile: "/upload/movie.mp4",
        s3Params: {
            Bucket: 'mm360-video',
            Key: 'upload/movie.mp4'
        }
    };
    const uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
    });
    uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
        console.log("done uploading");
    });

    // const s3 = new aws.S3();
    // const params = {
    //     Expires: 60,
    //     ContentType: file.filetype,
    //     Body: file,
    //     ACL: "public-read"
    // };
    //
    // s3.putObject(params, function (err, data) {
    //     if(data !== null){
    //         alert("アップロード成功!");
    //     } else {
    //         alert("アップロード失敗.");
    //     }
    // });
}

// $("#apply-upload").click(function() {
//     // var file = $("#upload-file").prop("files")[0];
//     // upload(file)
//     upload()
// });

// $("#apply-upload").click(function() {
//     var timestamp = new Date().getTime();
//     var filename = "file" + timestamp + ".jpg";
//     s3_client().putObject({Key: filename, ContentType: file.type, Body: file, ACL: "public-read"},
//         function(err, data){
//             // if failed, alert
//             if(data !== null){
//                 alert("アップロード成功!");
//             } else {
//                 alert("アップロード失敗.");
//             }

// });
