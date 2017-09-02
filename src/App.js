import React, { Component } from 'react';
import './App.css';
import {
    Route,
    BrowserRouter as Router,
    Switch
} from 'react-router-dom';

import Home from './Top.js'
import Project from "./Project";
import PanoramicView from "./PanoramicView";

export default class App extends Component {

    componentDidMount() {
        console.log(`App componentDidMount: ${process.env.PUBLIC_URL}`);
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path={process.env.PUBLIC_URL + "/"} component={Home} />
                    <Route path={process.env.PUBLIC_URL + "/project/:projectName"} component={Project}/>
                    <Route path={process.env.PUBLIC_URL + "/panorama/:projectName/"} component={PanoramicView}/>
                </Switch>
            </Router>
        );
    }
}
