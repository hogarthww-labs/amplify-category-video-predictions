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
            name: 'Identify Labels',
            value: 'identifyLabels',
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
  questions(_) {
    return [];
  },
  formatFlag(flag) {
    if (flag) return { format: 'ALL' };
    return { format: 'PLAIN' };
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
      {
        type: 'confirm',
        name: 'adminTask',
        message: 'Would you like to identify entities from a collection of images?',
        default: options.adminTask ? options.adminTask : false,
        when: answers => answers.setup === 'advanced',
      },
      {
        type: 'number',
        name: 'minConfidence',
        message: 'What confidence level would you like to use identify?',
        default: options.minConfidence ? options.minConfidence : 50,
        when: answers => answers.setup === 'advanced' && answers.adminTask,
        validate: value => (value > 0 && value < 101) || 'Please enter a number between 1 and 100!',
      },
      {
        type: 'list',
        name: 'folderPolicies',
        message: 'Would you like to allow users to add images to this collection?',
        choices: [
          {
            name: 'Yes',
            value: 'app',
          },
          {
            name: 'No',
            value: 'admin',
          },
        ],
        when: answers => answers.setup === 'advanced' && answers.adminTask,
        default: options.folderPolicies ? options.folderPolicies : 'app',
      },
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
  identifyText,
  identifyFaces,
  identifyLabels,
  adminTask,
  s3bucket,
};
