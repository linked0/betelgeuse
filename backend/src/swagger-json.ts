import * as dotenv from 'dotenv';
dotenv.config();

const json = {
  openapi: '3.0.0',
  info: {
    title: 'BOA SPACE API',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local server',
    },
  ],
  security: [
    {
      'x-api-key': [],
    },
  ],
  paths: {
    '/user/{userAddress}/assets': {
      get: {
        description: '',
        parameters: [
          {
            name: 'userAddress',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Asset',
                  },
                },
              },
            },
          },
          '404': {
            description: 'Not found',
          },
        },
      },
    },
    '/user/genApiKey': {
      get: {
        description: '',
        parameters: [],
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
    },
    '/user/': {
      get: {
        description: '',
        parameters: [],
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      'x-api-key': {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
    },
    schemas: {
      Asset: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier of the asset',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date and time the asset was created',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date and time the asset was last updated',
          },
          assetContractAddress: {
            type: 'string',
            description:
              'Address of the contract that defines the asset\'s behavior',
          },
          tokenId: {
            type: 'string',
            description: 'Unique identifier of the asset within its contract',
          },
          name: {
            type: 'string',
            description: 'Name of the asset',
          },
          description: {
            type: 'string',
            description: 'Description of the asset',
          },
          originalUrl: {
            type: 'string',
            description: 'URL of the asset\'s original image',
          },
          thumbnailUrl: {
            type: 'string',
            description: 'URL of the asset\'s thumbnail image',
          },
          previewUrl: {
            type: 'string',
            description: 'URL of the asset\'s preview image',
          },
          externalLink: {
            type: 'string',
            description:
              'URL of an external resource that provides additional information about the asset',
          },
          attribute: {
            type: 'string',
            description:
              'JSON-encoded data that describes the asset\'s properties, levels, and stats',
          },
          metadataLink: {
            type: 'string',
            description: 'URL of the asset\'s metadata file, if any',
          },
          backgroundColor: {
            type: 'string',
            description: 'Background color of the asset\'s image, if any',
          },
          totalSupply: {
            type: 'integer',
            description:
              'Total number of copies of the asset that can be created',
          },
          viewCount: {
            type: 'integer',
            description: 'Number of times the asset has been viewed',
          },
        },
      },
    },
  },
};

if (process.env.DEPLOY_TARGET === 'DEV') {
  json.servers = [
    {
      url: 'https://api.dev.boaspace.io/api/v1',
      description: 'Dev server',
    },
  ];
} else if (process.env.DEPLOY_TARGET === 'TEST') {
  json.servers = [
    {
      url: 'https://api.test.boaspace.io/api/v1',
      description: 'Test server',
    },
  ];
}

export default json;
