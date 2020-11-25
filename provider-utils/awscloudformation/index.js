import open from 'open';

const path = require('path');
const chalk = require('chalk');
const { NotImplementedError, ResourceDoesNotExistError, exitOnNextTick } = require('amplify-cli-core');
const parametersFileName = 'parameters.json';
const prefixForAdminTrigger = 'protected/predictions/video-ai/admin';
const walkThroughFolderName = 'prediction-category-walkthroughs'

function createPredictionCtgWalkthroughSrc(predictionsCategoryFilename) {
  return [__dirname, walkThroughFolderName, predictionsCategoryFilename].join('/');
}

function addResource(context, category, predictionsCategoryFilename, options) {
  const predictionCtgWalkthroughSrc = createPredictionCtgWalkthroughSrc(predictionsCategoryFilename)
  const { addWalkthrough } = require(predictionCtgWalkthroughSrc);

  return addWalkthrough(context).then(async resources => {
    options = Object.assign(options, resources);
    delete options.resourceName;
    context.amplify.updateamplifyMetaAfterResourceAdd(category, resources.resourceName, options);
    return resources.resourceName;
  });
}

function updateResource(context, predictionsCategoryFilename) {
  const predictionCtgWalkthroughSrc = createPredictionCtgWalkthroughSrc(predictionsCategoryFilename)
  const { updateWalkthrough } = require(predictionCtgWalkthroughSrc);

  if (!updateWalkthrough) {
    const errMessage = 'Update functionality not available for this service';
    context.print.error(errMessage);
    context.usageData.emitError(new NotImplementedError(errMessage));
    exitOnNextTick(0);
  }

  return updateWalkthrough(context).then(resource => resource.resourceName);
}

// currently only supports sagemaker and rekognition
async function console(context, resourceObj, amplifyMeta) {
  const service = resourceObj.service;
  const resourceName = resourceObj.name;
  let serviceOutput = '';

  if (service === 'Rekognition') {
    await printRekognitionUploadUrl(context, resourceName, amplifyMeta);
  }

  return serviceOutput;
}

async function printRekognitionUploadUrl(context, resourceName, amplifyMeta, showOnAmplifyStatus) {
  const projectBackendDirPath = context.amplify.pathManager.getBackendDirPath();
  const resourceDirPath = path.join(projectBackendDirPath, 'video-predictions', resourceName);
  const parametersFilePath = path.join(resourceDirPath, parametersFileName);
  const parameters = context.amplify.readJsonFile(parametersFilePath);
  if (parameters.adminTask) {
    const projectStorage = amplifyMeta.storage;
    const keys = Object.keys(projectStorage);
    let bucketName = '';
    keys.forEach(resource => {
      if (projectStorage[resource].service === 'S3') {
        if (projectStorage[resource].output) {
          bucketName = projectStorage[resource].output.BucketName;
        } else {
          const errMessage = 'Push the resources to the cloud using `amplify push` command.';
          context.print.error(errMessage);
          context.usageData.emitError(new ResourceDoesNotExistError(errMessage));
          exitOnNextTick(0);
        }
      }
    });

    if (bucketName === '' || !(amplifyMeta.predictions[resourceName].output && amplifyMeta.predictions[resourceName].output.collectionId)) {
      const errMessage = 'Push the resources to the cloud using `amplify push` command.';
      context.print.error(errMessage);
      context.usageData.emitError(new ResourceDoesNotExistError(errMessage));
      exitOnNextTick(0);
      return;
    }
    const region = amplifyMeta.providers.awscloudformation.Region;
    await openRekognitionUploadUrl(context, bucketName, region, parameters.folderPolicies, showOnAmplifyStatus);
  } else if (!showOnAmplifyStatus) {
    const errMessage =
      'Console command not supported for your configuration in the project. Use ‘amplify update predictions’ to modify your configurations.';
    // !showOnAmplifyStatus is used so that this message is not shown in amplify status scenario.
    context.print.error(errMessage);
    context.usageData.emitError(new NotImplementedError(errMessage));
    exitOnNextTick(0);
  }
}

async function openRekognitionUploadUrl(context, bucketName, region, folderPolicies, printOnlyURL) {
  const URL =
    folderPolicies === 'admin'
      ? `https://s3.console.aws.amazon.com/s3/buckets/${bucketName}/${prefixForAdminTrigger}/admin/?region=${region}`
      : `https://s3.console.aws.amazon.com/s3/buckets/${bucketName}/${prefixForAdminTrigger}/?region=${region}`;
  if (!printOnlyURL) {
    await open(URL, { wait: false });
  }
  context.print.info(
    chalk`Rekognition endpoint to upload Images: {blue.underline ${URL}} (Amazon Rekognition only supports uploading PNG and JPEG files)`,
  );
}

module.exports = {
  addResource,
  updateResource,
  console,
  printRekognitionUploadUrl,
};
