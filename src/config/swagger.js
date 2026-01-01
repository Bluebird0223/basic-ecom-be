const swaggerJsDoc = require('swagger-jsdoc');

/**
 * Swagger Configuration Options
 * 
 * This object defines the structure of your API documentation.
 * swaggerJsDoc will use this to generate the OpenAPI specification.
 */
const swaggerOptions = {
    definition: {
        // Current OpenAPI version (standard for documentation)
        openapi: '3.0.0',

        // Basic API Information
        info: {
            title: 'Professional Node.js API',
            version: '1.0.0',
            description: 'API Documentation for the swager_node project. Use this UI to test endpoints and view data structures.',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },

        // Server configurations (where your API is running)
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Development Server',
            },
        ],

        // Components define reusable structures like Security Schemes or Models
        components: {
            securitySchemes: {
                // Bearer Token authentication (standard for JWT)
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },

        // Global security setting (optional: can be applied per route instead)
        // This tells Swagger that endpoints might require the bearerAuth defined above
        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    /**
     * Search Paths
     * 
     * apis: Tells swagger-jsdoc where to look for your documentation comments (JSDoc).
     * Usually, these comments are in your route files or a separate documentation file.
     */
    apis: ['./src/routes/*.js', './src/controllers/*.js', './src/index.js'],
};

/**
 * Initialize Swagger JSDoc
 * This generates the "Specification" (the data that the UI will display)
 */
const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;
