/* eslint-disable no-multi-str */
import chalk from 'chalk';

const inquirer = require('inquirer');

function categories(info) {
  const questions = [
    {
      type: 'list',
      name: 'predictionsCategory',
      message: 'Please select from one of the categories below',
      choices: [
        {
          name: 'Labels',
          value: { type: 'labels', provider: 'awscloudformation', fileName: 'identify-walkthrough.js' },
        },
        {
          name: 'Faces',
          value: { type: 'faces', provider: 'awscloudformation', fileName: 'identify-walkthrough.js' },
        },
        {
          name: 'Text',
          value: { type: 'text', provider: 'awscloudformation', fileName: 'identify-walkthrough.js' },
        },
        {
          name: 'Celebrities',
          value: { type: 'celebrities', provider: 'awscloudformation', fileName: 'identify-walkthrough.js' },
        },
        {
          name: 'Learn More',
          value: 'learnMore',
        },
      ],
    },
  ];
  if (info) {
    let helpText =
      'Labels allows you to identify identify real world objects in a video such as chairs, desks, etc. which are referred to as “labels”.\n\
Faces allows you to identify faces in the video.\n\
Text allows you to identify text elements in the video\n\
Learn More: https://docs.amplify.aws/lib/predictions/intro/q/platform/js';
    helpText = `\n${helpText.replace(new RegExp('[\\n]', 'g'), '\n\n')}\n\n`;
    questions[0].prefix = chalk.green(helpText);
  }
  return questions;
}

export function consoleSupportedCategories() {
  return [
    {
      type: 'list',
      name: 'category',
      message: 'Please select from one of the categories below',
      choices: [        
        {
          name: 'Identify',
          value: {
            category: 'Labels',
            provider: 'awscloudformation',
            services: ['Rekognition'],
            type: 'identifyType',
            types: ['identifyLabels', 'identifyFaces', 'identifyText', 'identifyCelebrities'],
          },
        }
      ],
    },
  ];
}

export async function promptCategory() {
  const answers = await inquirer.prompt(categories(false));
  while (answers.predictionsCategory === 'learnMore') {
    Object.assign(answers, await inquirer.prompt(categories(true)));
  }
  return answers;
}

export async function promptConsoleSupportedCategory() {
  return await inquirer.prompt(consoleSupportedCategories());
}

export default {};
