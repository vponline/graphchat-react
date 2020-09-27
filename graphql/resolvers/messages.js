const {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
  withFilter,
} = require("apollo-server")
const { Op } = require("sequelize")
const { User, Message, Reaction } = require("../../models/index")

module.exports = {
  //{ from } comes from args, { user } comes from context
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated")

        //get the selected user
        const otherUser = await User.findOne({
          where: {
            username: from,
          },
        })

        if (!otherUser) throw new UserInputError("User not found")

        const usernames = [user.username, otherUser.username]

        //get messages for both chat participants
        const messages = await Message.findAll({
          where: {
            from: {
              [Op.in]: usernames,
            },
            to: {
              [Op.in]: usernames,
            },
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Reaction,
              as: "reactions",
            },
          ],
        })

        return messages
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
  Mutation: {
    //{ to, content } come from args.to and args.content
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated")

        //set the selected user as the recipient
        const recipient = await User.findOne({
          where: {
            username: to,
          },
        })
        if (!recipient) {
          throw new UserInputError("User not found")
        }
        //Prevent users from messaging themselves
        // else if (recipient.username === user.username) {
        //   throw new UserInputError("Cannot message self")
        // }

        if (content.trim() === "") {
          throw new UserInputError("Message content is required")
        }

        //create new message
        const message = await Message.create({
          from: user.username,
          to: to,
          content: content,
        })

        //publish new message to websocket
        pubsub.publish("NEW_MESSAGE", {
          newMessage: message,
        })

        return message
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    // { uuid, content } come from args, { user, pubsub } come from context
    reactToMessage: async (parent, { uuid, content }, { user, pubsub }) => {
      const reactions = [
        "👍",
        "👎",
        "🙄",
        "🥶",
        "☠",
        "🍝",
        "🍦",
        "🍩",
        "😢",
        "😆",
        "😯",
        "❤️",
        "😡",
      ]

      try {
        //throw error if no reaction
        if (!reactions.includes(content)) {
          throw new UserInputError("Invalid reaction")
        }

        const username = user ? user.username : ""
        user = await User.findOne({
          where: {
            username,
          },
        })
        if (!user) throw new AuthenticationError("Unauthenticated")

        const message = await Message.findOne({
          where: {
            uuid,
          },
        })
        if (!message) throw new UserInputError("Message not found")

        if (message.from !== user.username && message.to !== user.username) {
          throw new ForbiddenError("Unauthorized")
        }

        let reaction = await Reaction.findOne({
          where: {
            messageId: message.id,
            userId: user.id,
          },
        })

        if (reaction) {
          //update and save if a reaction already exists
          reaction.content = content
          await reaction.save()
        } else {
          //create new reaction if no reaction
          reaction = await Reaction.create({
            messageId: message.id,
            userId: user.id,
            content: content,
          })
        }

        pubsub.publish("NEW_REACTION", {
          newReaction: reaction,
        })

        return reaction
      } catch (err) {
        throw err
      }
    },
  },
  //setup graphql subscriptions for messages and reactions
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (parent, args, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated")
          return pubsub.asyncIterator("NEW_MESSAGE")
        },
        ({ newMessage }, _, { user }) => {
          if (
            newMessage.from === user.username ||
            newMessage.to === user.username
          ) {
            return true
          }

          return false
        }
      ),
    },
    newReaction: {
      subscribe: withFilter(
        (parent, args, { pubsub, user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated")
          return pubsub.asyncIterator("NEW_REACTION")
        },
        async ({ newReaction }, _, { user }) => {
          const message = await newReaction.getMessage()
          if (message.from === user.username || message.to === user.username) {
            return true
          }

          return false
        }
      ),
    },
  },
}
