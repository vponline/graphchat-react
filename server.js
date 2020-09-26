const {
  ApolloServer
} = require("apollo-server")
const {
  sequelize
} = require("./models/index")
const resolvers = require("./graphql/resolvers/index")
const typeDefs = require("./graphql/typedefs")
const authContext = require("./middleware/auth")

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authContext,
})

server.listen().then(({
  port
}) => {
  console.log(`Server running on port ${port}`)

  sequelize
    .authenticate()
    .then(() => console.log("Database connected"))
    .catch((err) => console.log(err))
})