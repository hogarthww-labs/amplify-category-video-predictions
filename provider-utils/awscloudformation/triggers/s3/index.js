const AWS = require('aws-sdk'); //eslint-disable-line
const querystring = require('querystring');
const { getNotificationChannel } = require('./sns');
const { isVideo } = require('./utils');
const config = require('./config');

exports.handler = async event => {
  const aws = {
    region: event.Records[0].awsRegion,
    ...config
  };  
  AWS.config.update(aws)

  const numberOfRecords = event.Records.length;
  console.log(numberOfRecords);  
  for (let j = 0; j < numberOfRecords; j++) {
    const evRecord = event.Records[j].params
    const params = evRecord.params || config
    const key = evRecord.s3.object.key;
    const decodeKey = Object.keys(querystring.parse(key))[0];
    const bucketName = evRecord.s3.bucket.name;
    const lastIndex = decodeKey.lastIndexOf('/');
    const extensionIndex = decodeKey.lastIndexOf('.');
    const extension = decodeKey.substring(extensionIndex + 1);
    const assetName = decodeKey.substring(lastIndex + 1);
    let functionName = params.functionName
    const isVid = isVideo(extension)

    if (!functionName) {
      functionName = isVid ? 'startLabelDetection' : 'indexFaces'
    }

    let asset = {
      params,
      'type': isVid ? 'video' : 'image',
      isVideo: isVid,
      isImage: !isVid,
      key,
      functionName,
      name: assetName,
      ext: extension,
      bucketName,
      decodeKey
    }

    if (isVid) {      
      NotificationChannel = await getNotificationChannel({params, aws})
      if (NotificationChannel) {
        asset.evRecord.NotificationChannel = NotificationChannel  
      }        
    }
  
    if (assetName === '') {
      console.log('creation of folder');
      return;
    }
    const externalAssetId = decodeKey.replace(/\//g, '::');
    asset.externalAssetId = externalAssetId
    console.log(decodeKey);
  
    if (event.Records[j].eventName === 'ObjectCreated:Put') {
      const processorFn = asset.isVideo ? processVideoAsset : processImageAsset
      processorFn(asset)
    } else {
      if (asset.isImage) {
        cleanupAsset(asset)
      }      
    }
  }
};
