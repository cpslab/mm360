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

        this.setState({ isLoading: true });

        console.log(this.state.text);
        const response = await fetch(`${this.rootUrl}/create`, {
            method: "POST",
            body: this.state.text
        });
        const result = await response.text();
        if (result === "success") {
            window.location.reload()
        } else {
            alert("failed to create project");
            this.setState({ isLoading: false });
        }
    };

    handleDeleteClick = async (projectName) => {
        const result = window.confirm(`${projectName}削除しますか？`);
        if (!result) {
            return;
        }

        this.setState({ isLoading: true });

        const response = await fetch(`${this.rootUrl}/project/${projectName}/delete`, { method: "POST" });
        const code = await response.status;
        if (code === 200) {
            window.location.reload();
        } else {
            alert("failed delete");
            this.setState({ isLoading: false });
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
                    <div style={{ marginBottom: 10 }}>
                        <Link to={`${process.env.PUBLIC_URL}/project/${item.projectName}`} >
                            {item.projectName}
                        </Link>
                        <button style={{ marginLeft: 10 }} onClick={() => this.handleDeleteClick(item.projectName)}>削除</button>
                    </div>
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
