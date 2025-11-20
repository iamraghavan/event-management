const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management System API',
      version: '1.0.0',
      description: 'API Documentation for the Event Management System (EMS) for EGS Pillay Group of Institutions.',
      contact: {
        name: 'API Support',
        email: 'web@egspec.org',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
      {
        url: 'https://api.egspec.org/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [require('path').join(__dirname, '../docs/swagger/*.js')], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
