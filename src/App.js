import React, { Component } from 'react';
import './App.css';
import {
    Route,
    Switch
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
            <main>
                <Switch>
                    {console.log("App")}
                    <Route exact path='/' component={Home} />
                    <Route path="/project/:projectName" component={Project}/>
                    <Route path="/panorama/:projectName/" component={PanoramicView}/>
                </Switch>
            </main>
        );
    }
}
