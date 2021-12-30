import React, { useState } from "react"
import { gql, useMutation } from "@apollo/client"
import { Link } from "react-router-dom"
import { Row, Col, Form, Button } from "react-bootstrap"

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
    $imageUrl: String
  ) {
    register(
      username: $username
      email: $email
      password: $password
      confirmPassword: $confirmPassword
      imageUrl: $imageUrl
    ) {
      username
      email
      createdAt
    }
  }
`

const Register = (props) => {
  const [variables, setVariables] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    imageUrl: "",
  })

  const [errors, setErrors] = useState({})

  const [register, { loading }] = useMutation(REGISTER_USER, {
    update: (_, __) => props.history.push("/login"),
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
  })

  const onSubmitRegister = (e) => {
    e.preventDefault()
    register({ variables })
  }

  return (
    <Row className="bg-container py-5 justify-content-center mx-sm-auto">
      <Col sm={8} md={6} lg={4}>
        <h1 className="text-center">Register</h1>
        <Form onSubmit={onSubmitRegister}>
          <Form.Group>
            <Form.Label className={errors.email && "text-danger"}>
              {errors.email ?? "Email address"}
            </Form.Label>
            <Form.Control
              type="email"
              value={variables.email}
              className={errors.email && "is-invalid"}
              onChange={(e) =>
                setVariables({ ...variables, email: e.target.value })
              }
            />
          </Form.Group>
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
          <Form.Group>
            <Form.Label className={errors.confirmPassword && "text-danger"}>
              {errors.confirmPassword ?? "Confirm Password"}
            </Form.Label>
            <Form.Control
              type="password"
              value={variables.confirmPassword}
              className={errors.confirmPassword && "is-invalid"}
              onChange={(e) =>
                setVariables({ ...variables, confirmPassword: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className={errors.imageUrl && "text-danger"}>
              {errors.imageUrl ?? "Avatar (optional)"}
            </Form.Label>
            <Form.Control
              type="text"
              value={variables.imageUrl}
              className={errors.imageUrl && "is-invalid"}
              onChange={(e) =>
                setVariables({ ...variables, imageUrl: e.target.value })
              }
            />
          </Form.Group>
          <div className="text-center">
            <Button
              className="mb-3"
              variant="success"
              type="submit"
              disabled={loading}>
              {loading ? "Loading..." : "Register"}
            </Button>
            <br />
            <Link to="/login">Login instead</Link>
          </div>
        </Form>
      </Col>
    </Row>
  )
}

export default Register
