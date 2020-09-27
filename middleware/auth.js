const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config/env.json")
const { AuthenticationError, PubSub } = require("apollo-server")

const pubsub = new PubSub()

module.exports = (context) => {
  let token
  if (context.req && context.req.headers.authorization) {
    //if http request get token from headers
    token = context.req.headers.authorization.split("Bearer ")[1]
  } else if (context.connection && context.connection.context.Authorization) {
    //if websocket connection get token from connection context
    token = context.connection.context.Authorization.split("Bearer ")[1]
  }
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      //error message if user is not logged in
      if (err) {
        throw new AuthenticationError("Unauthenticated")
      }
      context.user = decodedToken
    })
  }

  context.pubsub = pubsub

  return context
}
