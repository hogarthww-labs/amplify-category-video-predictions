/* eslint-disable object-shorthand */
/* eslint-disable no-multi-str */

// defaults for text, entity, and label categories

function identifyAccess(options) {
  return [
    {
      type: 'list',
      name: 'access',
      message: 'Who should have access?',
      choices: [
        {
          name: 'Auth users only',
          value: 'auth',
        },
        {
          name: 'Auth and Guest users',
          value: 'authAndGuest',
        },
      ],
      default: options.access ? options.access : 'auth',
    },
  ];
}

const setup = {
  type() {
    return [
      {
        type: 'list',
        name: 'identifyType',
        message: 'What would you like to identify?',
        choices: [
          {
            name: 'Identify Text',
            value: 'identifyText',
          },
          {
            name: 'Identify Faces',
            value: 'identifyFaces',
          },
          {
            name: 'Identify Celebrities',
            value: 'identifyCelebrities',
          },
          {
            name: 'Identify Labels',
            value: 'identifyLabels',
          },
        ],
      },
      {
        type: 'list',
        name: 'setup',
        message: 'Would you like use the default configuration?',
        choices: [
          {
            name: 'Default Configuration',
            value: 'default',
          },
          {
            name: 'Advanced Configuration',
            value: 'advanced',
          },
        ],
      },
    ];
  },
  name(defaultName) {
    return [
      {
        name: 'resourceName',
        message: 'Provide a friendly name for your resource',
        validate: value => {
          const regex = new RegExp('^[a-zA-Z0-9]+$');
          return regex.test(value) ? true : 'Resource name should be alphanumeric!';
        },
        default: defaultName,
      },
    ];
  },
};

const identifyText = {
  questions(options) {
    return [
      // https://docs.aws.amazon.com/rekognition/latest/dg/API_StartTextDetectionFilters.html
      {
        type: 'number',
        name: 'minConfidence',
        message: 'What confidence level would you like to use identify?',
        default: options.minConfidence ? options.minConfidence : 50,
        when: answers => answers.setup === 'advanced',
        validate: value => (value > 0 && value < 101) || 'Please enter a number between 1 and 100!',
      },
      {
        type: 'number',
        name: 'minBoundingBoxWidth',
        message: 'What is the minimum width of text to be identified?',
        default: options.minBoundingBoxWidth ? options.minBoundingBoxWidth : 50,
        when: answers => answers.setup === 'advanced',
        validate: value => (value > 10 && value < 4000) || 'Please enter a number > 10!',
      },
      {
        type: 'number',
        name: 'minBoundingBoxHeight',
        message: 'What is the minimum height of text to be identified?',
        default: options.minBoundingBoxHeight ? options.minBoundingBoxHeight : 10,
        when: answers => answers.setup === 'advanced',
        validate: value => (value > 5 && value < 2000) || 'Please enter a number > 5',
      },      
    ];
  },
  auth: identifyAccess,
};

const identifyCelebrities = {
  questions(_) {
    return [];
  },
  auth: identifyAccess,
};

const identifyFaces = {
  questions(_) {
    return [
      {
        name: 'faceAttributes',
        type: 'list',
        message: 'What face attributes do you want to identify?',
        choices: ['ALL', 'DEFAULT']         
      }
    ];
  },
  auth: identifyAccess
};


const identifyLabels = {
  questions(options) {
    return [
      {
        type: 'number',
        name: 'minConfidence',
        message: 'What confidence level would you like to use identify?',
        default: options.minConfidence ? options.minConfidence : 50,
        when: answers => answers.setup === 'advanced',
        validate: value => (value > 0 && value < 101) || 'Please enter a number between 1 and 100!',
      }
    ];
  },
  auth: identifyAccess,
  defaults: {
  },
};

const adminTask = [
  {
    type: 'list',
    name: 'folderPolicies',
    message: 'Who can have access to these assets? ',
    choices: [
      {
        name: 'Admins (via the CLI)',
        value: 'admin',
      },
      {
        name: 'App users (via the client app)',
        value: 'app',
      },
    ],
    when: answers => answers.adminTask,
    default: 'admin',
  },
];

const s3bucket = {
  key: 'bucketName',
  question: 'The CLI would be provisioning an S3 bucket to store these assets please provide bucket name:',
  validation: {
    operator: 'regex',
    value: '^[a-z0-9-]+$',
    onErrorMsg: 'Bucket name can only use the following characters: a-z 0-9 -',
  },
  required: true,
};

export default {
  setup,
  identifyAccess,
  identifyCelebrities,
  identifyText,
  identifyFaces,
  identifyLabels,
  adminTask,
  s3bucket,
};
