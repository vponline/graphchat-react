import React from "react"
import moment from "moment"
import { gql, useQuery } from "@apollo/client"
import { Col, Image } from "react-bootstrap"
import { useMessageDispatch, useMessageState } from "../../context/message"

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      createdAt
      imageUrl
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`

const Users = () => {
  const dispatch = useMessageDispatch()
  const { users } = useMessageState()
  //users?.find runs only if users exists and otherwise returns undefined
  const selectedUser = users?.find((u) => u.selected === true)?.username

  const { loading } = useQuery(GET_USERS, {
    onCompleted: (data) =>
      dispatch({ type: "SET_USERS", payload: data.getUsers }),
    onError: (err) => console.log(err),
  })

  let userContent
  if (!users || loading) {
    userContent = <p>Loading...</p>
  } else if (users.length === 0) {
    userContent = <p>No other users yet</p>
  } else if (users.length > 0) {
    userContent = users.map((user) => {
      const selected = selectedUser === user.username
      return (
        <div
          role="button"
          className={`user-div d-flex justify-content-center justify-content-md-start p-1 no-select
            ${selected ? "bg-user" : ""}`}
          key={user.username}
          onClick={() =>
            dispatch({ type: "SET_SELECTED_USER", payload: user.username })
          }>
          {user.imageUrl ? (
            <Image
              src={
                user.imageUrl ||
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              }
              className="user-image"
            />
          ) : (
            <div className="user-image">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="d-none d-md-block ml-2">
            <p className="text-success">
              <div className="d-flex justify-content-between">
                <p>{user.username}</p>
                <small className="text-muted right-align">
                  {user.latestMessage &&
                    moment(user.latestMessage.createdAt).format("HH:mm")}
                </small>
              </div>
            </p>
            <p className="font-weight-light">
              {user.latestMessage
                ? user.latestMessage.content.substring(0, 20) + "..."
                : "You are now connected!"}
            </p>
          </div>
        </div>
      )
    })
  }

  return (
    <Col xs={2} md={4} className="p-0 user-container">
      {userContent}
    </Col>
  )
}

export default Users
