import React, { useState } from "react"
import { gql, useMutation } from "@apollo/client"
import moment from "moment"
import { useAuthState } from "../../context/auth"
import { Button, OverlayTrigger, Popover, Tooltip } from "react-bootstrap"
import { GrEmoji } from "react-icons/gr"

const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"]

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid: String!, $content: String!) {
    reactToMessage(uuid: $uuid, content: $content) {
      uuid
    }
  }
`

const Message = ({ message }) => {
  const { user } = useAuthState()
  //if message.from === user.username, sent = true, otherwise false
  const sent = message.from === user.username
  const received = !sent
  const [showPopover, setShowPopover] = useState(false)
  const reactionicons = [...new Set(message.reactions.map((r) => r.content))]

  const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
    onError: (err) => console.log(err),
    onCompleted: (data) => setShowPopover(false),
  })

  const react = (reaction) => {
    reactToMessage({ variables: { uuid: message.uuid, content: reaction } })
  }

  const reactButton = (
    <OverlayTrigger
      trigger="click"
      placement="top"
      onToggle={setShowPopover}
      transition={false}
      rootClose
      show={showPopover}
      overlay={
        <Popover>
          <Popover.Content className="d-flex px-0 py-1  align-items-center react-button-popover">
            {reactions.map((reaction) => (
              <Button
                variant="link"
                className="react-icon-button"
                key={reaction}
                onClick={() => react(reaction)}>
                {reaction}
              </Button>
            ))}
          </Popover.Content>
        </Popover>
      }>
      <Button variant="link" className="px-2">
        <GrEmoji size={20} />
      </Button>
    </OverlayTrigger>
  )

  return (
    <div
      className={`d-flex my-1 ${sent ? "ml-auto" : ""} ${
        received ? "mr-auto" : ""
      }`}>
      {sent && reactButton}
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            {moment(message.createdAt).format("HH:mm, DD/MM/YYYY")}
          </Tooltip>
        }
        transition={false}>
        <div
          className={`py-2 px-2 position-relative ${sent ? "bg-message" : ""} ${
            received ? "bg-secondary" : ""
          }`}>
          {message.reactions.length > 0 && (
            <div
              className={`reaction-container bg-reaction ${
                sent ? "reaction-sent" : ""
              } ${received ? "reaction-received" : ""}`}>
              {sent && <sup>{message.reactions.length}</sup>}
              {reactionicons}
              {received && <sup>{message.reactions.length}</sup>}
            </div>
          )}
          <p className={sent ? "text-white" : ""} key={message.uuid}>
            {message.content}
          </p>
          <div className="d-flex justify-content-end">
            <small className="text-muted">
              {moment(message.createdAt).format("HH:mm")}
            </small>
          </div>
        </div>
      </OverlayTrigger>
      {received && reactButton}
    </div>
  )
}

export default Message
