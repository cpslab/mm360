import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'


class Home extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

class Board extends Component {
    renderSquare(i) {
        return <Square value={i} />
    }
}

class Square extends Component {
    render() {
        return (
            <button className="square">
                {this.props.value}
            </button>
        )
    }
}

class Upload extends Component {
    render() {
        return (
            <div className="App">
                <button className="upload">
                    test
                </button>
                <p>test</p>
            </div>
        )
    }
}

const MyRouter = () => (
    <Router>
        <div>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/board">Board</Link></li>
                <li><Link to="/upload">Upload</Link></li>
            </ul>

            <hr/>

            <Route exact path="/" component={Home}/>
            <Route path="/about" component={Board}/>
            <Route path="/upload" component={Upload}/>
        </div>
    </Router>
);


export default MyRouter;
