import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'
import fetch from 'isomorphic-fetch'
import queryString from 'query-string'

import Home from './Top.js'

const policyRootUrl = "http://localhost:5000/api/policy";

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

    state = { isPosting: false };

    componentDidMount() {
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        console.log(this.state.postUrl);
        this.setState({ isPosting: true });

        await fetch(this.state.postUrl, {
            method: 'PUT',
            body: this.state.file,
            headers: {
                "Content-Type": this.state.file.type
            }
        });
        this.setState({ isPosting: false })
    };

    handleFile = (e) => {
        const reader = new FileReader();
        const file = e.target.files[0];

        reader.onload = async () => {
            const param = {
                project_name: "test",
                filename: file.name,
                content_type: file.type
            };

            const policyUrl = policyRootUrl + "?" + queryString.stringify(param);
            console.log(policyUrl);
            const url = await (await fetch(policyUrl)).text();

            this.setState({
                 postUrl: url,
                 file: file
            });
        };

        reader.readAsDataURL(file);
    };

    render() {

        return (
            <div className="App">
                <form onSubmit={this.handleSubmit} encType="multipart/form-data">
                    <input type="file" onChange={this.handleFile} />
                    <input className='btn btn-primary' type="submit" value="Upload" />
                </form>
                <p>{this.state.isPosting ? "progress..." : ""}</p>
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
