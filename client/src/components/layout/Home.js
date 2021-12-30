import React, { Fragment, useEffect } from "react"
import { Row, Button } from "react-bootstrap"
import { gql, useSubscription } from "@apollo/client"
import { useAuthDispatch, useAuthState } from "../../context/auth"
import { useMessageDispatch } from "../../context/message"
import Users from "./Users"
import Messages from "./Messages"
import { AiOutlineLogout } from "react-icons/ai"

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`

const NEW_REACTION = gql`
  subscription newReaction {
    newReaction {
      uuid
      content
      message {
        uuid
        from
        to
      }
    }
  }
`

const Home = ({ history }) => {
  const authDispatch = useAuthDispatch()
  const messageDispatch = useMessageDispatch()
  const { user } = useAuthState()

  const { data: messageData, error: messageError } = useSubscription(
    NEW_MESSAGE
  )
  const { data: reactionData, error: reactionError } = useSubscription(
    NEW_REACTION
  )

  useEffect(() => {
    if (messageError) console.log(messageError)

    if (messageData) {
      const message = messageData.newMessage
      const otherUser = user.username === message.to ? message.from : message.to

      messageDispatch({
        type: "ADD_MESSAGE",
        payload: {
          username: otherUser,
          message: message,
        },
      })
    }
    //eslint-disable-next-line
  }, [messageError, messageData])

  useEffect(() => {
    if (reactionError) console.log(reactionError)

    if (reactionData) {
      const reaction = reactionData.newReaction
      const otherUser =
        user.username === reaction.message.to
          ? reaction.message.from
          : reaction.message.to

      messageDispatch({
        type: "ADD_REACTION",
        payload: {
          username: otherUser,
          reaction: reaction,
        },
      })
    }
    //eslint-disable-next-line
  }, [reactionError, reactionData])

  const logout = () => {
    authDispatch({ type: "LOGOUT" })
    window.location.href = "/login"
  }

  return (
    <Fragment>
      <Row className="d-flex bg-container mx-sm-auto justify-content-end nav-container">
        <Button variant="link" onClick={logout}>
          <AiOutlineLogout size={32} />
        </Button>
      </Row>
      <Row className="bg-container mx-sm-auto">
        <Users />
        <Messages />
      </Row>
    </Fragment>
  )
}

export default Home
