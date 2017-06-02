const Hapi = require('hapi')

const routes = require('./routes')

// Create a server with a host and port
const server = new Hapi.Server()

server.connection({
  host: 'localhost',
  port: process.env.PORT || 8000,
  routes: {
    cors: {
      additionalExposedHeaders: ['Authorization', 'x-requested-with'],
      additionalHeaders: ['x-run-id', 'x-requested-with']
    },
    response: {
      // Do not throw error when failing validation
      failAction: 'log',
      // Options to pass through to Joi validate function
      options: {
        allowUnknown: false
      }
    }
  }
})

// Add the routes
server.route(routes.enpoints)

// Start the server
server.start((err) => {
  if (err) {
    throw err
  }

  console.log('Server running at:', server.info.uri)
})

module.exports = server