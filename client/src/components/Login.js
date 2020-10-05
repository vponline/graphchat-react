import React, { useState } from "react"
import { gql, useLazyQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import { Row, Col, Form, Button } from "react-bootstrap"

import { useAuthDispatch } from "../context/auth"

const LOGIN_USER = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      username
      email
      createdAt
      token
    }
  }
`

const Login = (props) => {
  const [variables, setVariables] = useState({
    username: "",
    password: "",
  })

  const [errors, setErrors] = useState({})

  const dispatch = useAuthDispatch()

  const [login, { loading }] = useLazyQuery(LOGIN_USER, {
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
    onCompleted(data) {
      dispatch({ type: "LOGIN", payload: data.login })
      window.location.href = "/"
    },
  })

  const onSubmitLogin = (e) => {
    e.preventDefault()
    login({ variables })
  }

  return (
    <Row className="bg-container py-5 justify-content-center">
      <Col sm={8} md={6} lg={4}>
        <h1 className="text-center">Login</h1>
        <Form onSubmit={onSubmitLogin}>
          <Form.Group>
            <Form.Label className={errors.username && "text-danger"}>
              {errors.username ?? "Username"}
            </Form.Label>
            <Form.Control
              type="text"
              value={variables.username}
              className={errors.username && "is-invalid"}
              onChange={(e) =>
                setVariables({ ...variables, username: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={errors.password && "text-danger"}>
              {errors.password ?? "Password"}
            </Form.Label>
            <Form.Control
              type="password"
              value={variables.password}
              className={errors.password && "is-invalid"}
              onChange={(e) =>
                setVariables({ ...variables, password: e.target.value })
              }
            />
          </Form.Group>
          <div className="text-center">
            <Button
              className="mb-3"
              variant="success"
              type="submit"
              disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
            <br />
            <Link to="/register">Create account</Link>
          </div>
        </Form>
      </Col>
    </Row>
  )
}

export default Login
