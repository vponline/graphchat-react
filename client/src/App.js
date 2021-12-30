import React from "react"
import { Container } from "react-bootstrap"
import { BrowserRouter, Switch } from "react-router-dom"
import "./styles.scss"
import ApolloProvider from "./ApolloProvider"
import { AuthProvider } from "./context/auth"
import { MessageProvider } from "./context/message"
import PrivateRoute from "./routing/PrivateRoute"
import Home from "./components/layout/Home"
import Register from "./components/Register"
import Login from "./components/Login"

const App = () => {
  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Container className="pt-sm-5">
              <Switch>
                <PrivateRoute exact path="/" component={Home} authenticated />
                <PrivateRoute path="/register" component={Register} guest />
                <PrivateRoute path="/login" component={Login} guest />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App
