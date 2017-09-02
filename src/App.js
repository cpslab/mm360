import React, { Component } from 'react';
import './App.css';
import {
    Route,
    BrowserRouter as Router
} from 'react-router-dom';

import Home from './Top.js'
import Project from "./Project";
import PanoramicView from "./PanoramicView";

export default class App extends Component {

    componentDidMount() {
        console.log("App componentDidMount");
    }

    render() {
        return (
            <Router>
                <div>
                    <Route path={process.env.PUBLIC_URL + "/"} component={Home} />
                    <Route path={process.env.PUBLIC_URL + "/project/:projectName"} component={Project}/>
                    <Route path={process.env.PUBLIC_URL + "/panorama/:projectName/"} component={PanoramicView}/>
                </div>
            </Router>
        );
    }
}
