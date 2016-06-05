Amazon JP Auto Orderer
===

## Overview

This automates purchace from [Amazon JP](http://amazon.co.jp), worknig on AWS Lambda and PhantomJS.

Architecture is as below.


```
+--------------------------+
|                          |
| AWS Lambda (Node.js 4.3) |
|                          |
+------------+-------------+
             |
             | 1. execute as child process
             |
+------------v-------------+    2. crawl     +---------------+
|                          +---------------->|               |
|    PhantomJS (v2.1.1)    |                 |   Amazon JP   |
|                          |<----------------+               |
+--------------------------+                 +---------------+
```


## Requirement

This works on Node.js v4.3 or newer.

This uses [node-lambda](https://github.com/motdotla/node-lambda) for build and deploy lambda function.  
To install node-lambda, execute following command.

```
npm install -g node-lambda
```

## Install

```
git clone https://github.com/jsoizo/amazon-jp-auto-orderer.git
cd amazon-jp-auto-orderer

npm install
```

## Usage

### Local Development Environment

write `.env` file as below, and execute `node-lambda run`

```.env
AWS_ENVIRONMENT=development
AWS_ACCESS_KEY_ID=SOME_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=SOME_ACCESS_SECRET
AWS_SESSION_TOKEN=
AWS_ROLE_ARN=
AWS_REGION=ap-northeast-1
AWS_FUNCTION_NAME=
AWS_HANDLER=index.handler
AWS_MODE=event
AWS_MEMORY_SIZE=512
AWS_TIMEOUT=60
AWS_DESCRIPTION=
AWS_RUNTIME=nodejs4.3
MODE=development
AMAZON_JP_EMAIL=mail@example.com
AMAZON_JP_PASSWORD=Password
AMAZON_JP_ITEM_URL=http://www.amazon.co.jp/dp/XXXXXXXXX
CAPTURE_IMAGE_PATH=/tmp/one_click_order.png
CAPTURE_BUCKET=
```

### on Production(AWS Lambda) Environment

write `deploy.env` file as below, and execute `node-lambda run`

```
MODE=production
AWS_REGION=ap-northeast-1
AMAZON_JP_EMAIL=mail@example.com
AMAZON_JP_PASSWORD=Password
AMAZON_JP_ITEM_URL=http://www.amazon.co.jp/dp/XXXXXXXXX
CAPTURE_IMAGE_PATH=/tmp/one_click_order.png
CAPTURE_BUCKET=any-bucket-name
```

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[jsoizo](https://github.com/jsoizo)
