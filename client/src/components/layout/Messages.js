import React, { useState, useEffect, useRef, Fragment } from "react"
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { Col, Form } from "react-bootstrap"
import { MdSend } from "react-icons/md"
import { useMessageDispatch, useMessageState } from "../../context/message"
import Message from "./Message"

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
      reactions {
        uuid
        content
      }
    }
  }
`

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`

const Messages = () => {
  const { users } = useMessageState()
  const dispatch = useMessageDispatch()
  const [content, setContent] = useState("")
  const messageRef = useRef()

  const selectedUser = users?.find((u) => u.selected === true)
  const messages = selectedUser?.messages

  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES)

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (err) => console.log(err),
  })

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } })
    }
    //eslint-disable-next-line
  }, [selectedUser])

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      })
    }
    //eslint-disable-next-line
  }, [messagesData])

  const scrollToLatestMessage = () => {
    messageRef.current.scrollIntoView()
  }

  const submitMessage = (e) => {
    e.preventDefault()

    if (content.trim() === "" || !selectedUser) return
    setContent("")
    sendMessage({ variables: { to: selectedUser.username, content: content } })
    scrollToLatestMessage()
  }

  let activeChatContent
  if (!messages && !messagesLoading) {
    activeChatContent = (
      <p className="info-text">Select a chat to start messaging</p>
    )
  } else if (messagesLoading) {
    activeChatContent = <p className="info-text">Loading...</p>
  } else if (messages.length > 0) {
    activeChatContent = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ))
  } else if (messages.length === 0) {
    activeChatContent = <p className="info-text">Send a message</p>
  }

  return (
    <Col xs={10} md={8} className="p-0">
      <div className="messages-container d-flex flex-column-reverse p-0">
        <div ref={messageRef}></div>
        {activeChatContent}
      </div>
      <div className="message-send-container">
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center m-0">
            <Form.Control
              type="text"
              className="message-input border-0 p-4"
              placeholder="Write a message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <MdSend
              className="send-btn text-primary ml-2"
              role="button"
              onClick={submitMessage}
            />
          </Form.Group>
        </Form>
      </div>
    </Col>
  )
}

export default Messages
