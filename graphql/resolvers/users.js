const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { UserInputError, AuthenticationError } = require("apollo-server")
const { Op } = require("sequelize")
const { JWT_SECRET } = require("../../config/env.json")
const { User, Message } = require("../../models/index")

module.exports = {
  Query: {
    //{ user } is coming from context.user
    getUsers: async (parent, args, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated")
        //get all users from database
        let users = await User.findAll({
          attributes: ["username", "imageUrl", "createdAt"],
          where: {
            username: {
              [Op.ne]: user.username,
            },
          },
        })

        //get messages for each user
        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [
              {
                from: user.username,
              },
              {
                to: user.username,
              },
            ],
          },
          order: [["createdAt", "DESC"]],
        })

        //find the latest message for each user
        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          )
          otherUser.latestMessage = latestMessage
          return otherUser
        })

        return users
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    login: async (parent, args) => {
      const { username, password } = args
      let errors = {}

      try {
        if (username.trim() === "") errors.username = "Username is required"
        if (password === "") errors.password = "Password is required"

        //throw error if there are any errors in the errors object
        if (Object.keys(errors).length > 0) {
          throw new UserInputError("Bad input", {
            errors,
          })
        }

        const user = await User.findOne({
          where: {
            username: username,
          },
        })

        if (!user) {
          errors.username = "User not found"
          throw new UserInputError("User not found", {
            errors,
          })
        }

        const correctPassword = await bcrypt.compare(password, user.password)

        if (!correctPassword) {
          errors.password = "Password is incorrect"
          throw new UserInputError("Password is incorrect", {
            errors,
          })
        }

        const token = jwt.sign(
          {
            username: username,
          },
          JWT_SECRET,
          {
            expiresIn: 60 * 60,
          }
        )

        return {
          ...user.toJSON(),
          token,
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
  Mutation: {
    register: async (parent, args, context, info) => {
      let { username, email, password, confirmPassword } = args
      let errors = {}

      try {
        //validate input data
        if (email.trim() === "") errors.email = "Email is required"
        if (username.trim() === "") errors.username = "Username is required"
        if (password.trim() === "") errors.password = "Password is required"
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "Password confirmation is required"
        if (password !== confirmPassword)
          errors.confirmPassword = "Passwords must match"

        // // check if username or email exists
        // const userByUsername = await User.findOne({ where: { username: username } })
        // const userByEmail = await User.findOne({ where: { email: email } })

        // if(userByUsername) errors.username = 'username is taken'
        // if(userByEmail) errors.email = 'email is taken'

        if (Object.keys(errors).length > 0) {
          throw errors
        }

        //hash password
        password = await bcrypt.hash(password, 6)

        //create user
        const user = await User.create({
          username,
          email,
          password,
        })
        //return user as json to the client
        return user
      } catch (err) {
        console.log(err)
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach(
            (e) =>
              (errors[e.path.split("users.")[1]] = `${
                e.path.split("users.")[1]
              } is already taken`)
          )
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((e) => (errors[e.path] = e.message))
        }
        throw new UserInputError("Bad input", {
          errors,
        })
      }
    },
  },
}
