import React, {Component} from 'react';
import fetch from 'isomorphic-fetch'
import {Link} from "react-router-dom";

export default class Home extends Component {

    // rootUrl = "http://localhost:5000/api";
    rootUrl = "https://rocky-woodland-39339.herokuapp.com/api";

    state = {
        projectList: [],
        text: ""
    };

    componentDidMount() {
        console.log("Top componentDidMount");
        this.fetchProjectList();
    }

    fetchProjectList = async () => {
        const response = await fetch(`${this.rootUrl}/projects`);
        const list = await response.json();
        this.setState({ projectList: list });
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
                {
                    this.state.projectList.map(item =>
                        <p><Link to={`${process.env.PUBLIC_URL}/project/${item.projectName}`} >{item.projectName}</Link></p>)
                }

                <form onSubmit={this.handleSubmit}>
                    <input type="text" value={this.state.text} onChange={this.handleChange} />
                    <button type="submit" value="submit" >Submit</button>
                </form>
            </div>
        )
    }
}
