import React from 'react';
import { Symfoni } from "./hardhat/SymfoniContext";
import { HackathonMunon } from './components/HackathonMunon';
import { Hackathon } from './components/Hackathon';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function Index() {
  return (
    <div className="App">
      <header className="App-header">
        <Symfoni autoInit={true} >
          <HackathonMunon></HackathonMunon>
        </Symfoni>
      </header>
    </div>
  );
}
function HackathonRoute({ match }) {
  return (
    <div className="App">
      <header className="App-header">
        <Symfoni autoInit={true} >
          <Hackathon></Hackathon>
        </Symfoni>
      </header>
    </div>
  );
}

function AppRouter() {
return (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
      <Route path="/" exact component={Index} />
      <Route path="/hackathons/:id" component={HackathonRoute} />
    </div>
  </Router>
);
}

export default AppRouter;
