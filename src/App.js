import React, { Component } from 'react';
import './App.css';
import {
    Route,
    Switch
} from 'react-router-dom';

import Home from './Top.js'
import Project from "./Project";
import PanoramicView from "./PanoramicView";

const MyRouter = () => (
    <main>
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path="/project/:projectName" component={Project}/>
            <Route path="/panorama/:projectName/" component={PanoramicView}/>
        </Switch>
    </main>
);

export default MyRouter;
