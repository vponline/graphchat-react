const { ApolloServer } = require('apollo-server')
const resolvers = require('./graphql/resolvers/index')
const typeDefs = require('./graphql/typedefs')

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ port }) => {
  console.log(`Server running on port ${port}`);
});