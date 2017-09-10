import React, {Component} from 'react';
import fetch from 'isomorphic-fetch'
import {Link} from "react-router-dom";

export default class Home extends Component {

    // rootUrl = "http://localhost:5000/api";
    rootUrl = "https://mm360-server.herokuapp.com/api";

    state = {
        projectList: [],
        isLoading: true,
        text: ""
    };

    componentDidMount() {
        console.log("Top componentDidMount");
        this.fetchProjectList();
    }

    fetchProjectList = async () => {
        const response = await fetch(`${this.rootUrl}/projects`);
        const list = await response.json();
        this.setState({
            projectList: list,
            isLoading: false,
        });
    };

    handleChange = (e) => {
        console.log(e.target.value);
        this.setState({ text: e.target.value })
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        console.log(this.state.text);
        const response = await fetch(`${this.rootUrl}/create`, {
            method: "POST",
            body: this.state.text
        });
        const result = await response.text();
        if (result === "success") {
            window.location.reload()
        } else {
            alert("upload error");
        }
    };

    render() {
        return (
            <div>
                { this.createNewProjectBlock() }
                <br/>
                { this.createProjectListBlock() }
                <br/>
            </div>
        )
    }

    createProjectListBlock = () => {
        return (
            <div>
                <h2>Project List</h2>
                { this.state.isLoading ? "loading..." :
                    this.state.projectList.map(item =>
                        <p><Link to={`${process.env.PUBLIC_URL}/project/${item.projectName}`} >
                            {item.projectName}
                        </Link></p>
                    )
                }
            </div>
        )
    };

    createNewProjectBlock = () => {
        return (
            <div>
                <h2>Create New Project</h2>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" value={this.state.text} onChange={this.handleChange} />
                    <button type="submit" value="submit" >create</button>
                </form>
            </div>
        )
    }
}
