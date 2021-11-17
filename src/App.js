import React,  { Fragment, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Tickets from "./components/Tickets";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Chat from "./components/Chat";
import UserInfo from "./components/UserInfo";
import HomePage from "./components/Homepage"
import NavbarMember from "./components/NavbarMember"
import './App.css'

function App () {
  //const [isMember, setToMember] = React.useState(false);
  const [isNavigator, setToNavigator] = useState(false);
  const [isMember, setToMember] = useState(false)
  return (
    <Fragment>
      <BrowserRouter>
      <HomePage setIsNavigator={setToNavigator} setMember={setToMember}/>
      <Navbar navigator={isNavigator} member={isMember}/>
      <NavbarMember member={isMember} navigator={isNavigator}/>
      <Switch>
      {/* <Route exact path='/' component={HomePage}/>; */}
      <Route exact path='/chat' component={Chat}/>;
      <Route path='/tickets' component={Tickets}/>;
      <Route path='/userinfo' component={UserInfo}/>;
      </Switch>
      </BrowserRouter>
    </Fragment>
  );
}

export default App;

