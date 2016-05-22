var path = require('path'),
    fs = require('fs'),
    http = require('http'),
    request = require('request'),
    childProcess = require('child_process'),
    aws = require('aws-sdk'),
    If = require('ifx');

var mode = process.env['MODE'],
      amazonEmail = process.env['AMAZON_JP_EMAIL'],
      amazonPass = process.env['AMAZON_JP_PASSWORD'],
      amazonItemUrl = process.env['AMAZON_JP_ITEM_URL'],
      captureImagePath = process.env['CAPTURE_IMAGE_PATH'],
      captureBucket = process.env['CAPTURE_BUCKET'];

// Call the phantomjs script
function callPhantom(callback) {
  var phantomJsPath = If (mode === 'production')(function(){
    return path.join(__dirname, 'phantomjs')
  }).Else( function() {
    return path.join(__dirname, 'node_modules', 'phantomjs-prebuilt', 'bin', 'phantomjs')
  });

  var errorMessage = "";

  var childArgs = [
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
  var phantomExecution = childProcess.execFile(phantomJsPath, childArgs);

  phantomExecution.stdout.on('data', function (data) {
    console.log(data);
  });

  phantomExecution.stderr.on('data', function (data) {
    console.log('phantom error  ---:> ' + data);
    errorMessage = errorMessage + data + "\n";
  });

  phantomExecution.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    callback(code, errorMessage);
  });
}

// Entry Point
exports.handler = function( event, context ) {

  function main(error) {
    if (error) {
      throw error;
      context.done();
    }

    // Execute the phantom call and exit
    callPhantom(function(code, errorMessage) {
      var message = If(errorMessage.length > 0)(function(){
        return "Fail!!! \n" + errorMessage;
      }).Else(function(){
        return "Success!!!";
      });

      var s3bucket = new aws.S3({params: {Bucket: captureBucket}});
      var params = {
        Key : "one_click_order/" + new Date().getTime() + ".png",
        Body : fs.readFileSync(captureImagePath)
      }
      s3bucket.upload(params, function(err, data) {
        if (err) {
          console.log(err);
          context.done();
        } else {
          console.log("successfully upload to s3")
          context.done();
        }
      })
    });
  }

  if (mode === 'production') {
    process.env['LD_LIBRARY_PATH'] = '/tmp/fontconfig/usr/lib/';
    childProcess.exec('cp -r fontconfig /tmp; /tmp/fontconfig/usr/bin/fc-cache -fs', main);
  } else {
    main();
  }
}
