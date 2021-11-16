import React,  { Fragment } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Tickets from "./components/Tickets";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Chat from "./components/Chat";
import UserInfo from "./components/UserInfo";
import HomePage from "./components/Homepage"

function App () {


  return (
    <Fragment>
      <BrowserRouter>
      <Navbar/>
      <Switch>
      <Route exact path='/' component={HomePage}/>;
      <Route exact path='/chat' component={Chat}/>;
      <Route path='/tickets' component={Tickets}/>;
      <Route path='/userinfo' component={UserInfo}/>;
      </Switch>
      </BrowserRouter>
    </Fragment>
  );
}

export default App;