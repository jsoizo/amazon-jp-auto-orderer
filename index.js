const path = require('path'),
      fs = require('fs'),
      http = require('http'),
      request = require('request'),
      childProcess = require('child_process'),
      aws = require('aws-sdk'),
      If = require('ifx');

const mode = process.env['MODE'],
      amazonEmail = process.env['AMAZON_JP_EMAIL'],
      amazonPass = process.env['AMAZON_JP_PASSWORD'],
      amazonItemUrl = process.env['AMAZON_JP_ITEM_URL'],
      captureImagePath = process.env['CAPTURE_IMAGE_PATH'],
      captureBucket = process.env['CAPTURE_BUCKET'];

// Call the phantomjs script
const callPhantom = (callback) => {
  const phantomJsPath = If (mode === 'production')(() => {
    return path.join(__dirname, 'phantomjs')
  }).Else(() => {
    return path.join(__dirname, 'node_modules', 'phantomjs-prebuilt', 'bin', 'phantomjs')
  });

  const childArgs = [
    path.join(__dirname, 'phantomjs-script.js'),
    amazonEmail,
    amazonPass,
    amazonItemUrl,
    captureImagePath
  ];

  // This option causes the shared library loader to output
  // useful information if phantomjs can't start.
  process.env['LD_WARN'] = 'true';

  console.log('Calling phantom: ', phantomJsPath);
  const phantomExecution = childProcess.execFile(phantomJsPath, childArgs);

  phantomExecution.stdout.on('data', function (data) {
    console.log('[phantom info] ' + data);
  });

  phantomExecution.stderr.on('data', function (data) {
    console.log('[phantom error] ' + data);
  });

  phantomExecution.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    callback(code);
  });
}

// Entry Point
exports.handler = (event, context, callback) => {

  const main = () => {
    // Execute the phantom call and exit
    callPhantom((code) => {
      const message = If(code !== 0)(() => "Fail!!!").Else(() => "Success!!!");

      const s3bucket = new aws.S3({params: {Bucket: captureBucket}});
      const params = {
        Key : "one_click_order/" + new Date().getTime() + ".png",
        Body : fs.readFileSync(captureImagePath)
      };
      s3bucket.upload(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully upload to s3")
        }
        callback();
      });
    });
  }

  if (mode === 'production') {
    process.env['LD_LIBRARY_PATH'] = '/tmp/fontconfig/usr/lib/';
    const fontConfigCacheCmd = 'cp -r fontconfig /tmp; /tmp/fontconfig/usr/bin/fc-cache -fs';
    childProcess.exec(fontConfigCacheCmd, (error) => {
      if (error) {
        throw error;
        callback();
      } else {
        main();
      }
    });
  } else {
    main();
  }
}
