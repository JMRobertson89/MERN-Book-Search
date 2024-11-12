const express = require('express');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const db = require('./config/connection');
const routes = require('./routes');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => authMiddleware({ req }),
  });

  await server.start();

  // Define Apollo Server middleware
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => authMiddleware({ req }),
    })
  );

  // Serve static files in production only
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  } else {
    console.log('Development mode: Vite should be serving static files separately');
  }

  // Additional routes
  app.use(routes);

  // Start the server after Apollo Server middleware is set
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Server listening at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}/graphql`);
    });
  });
}

startApolloServer();
