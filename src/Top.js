import React, {Component} from 'react';
import fetch from 'isomorphic-fetch'
import queryString from 'query-string'

export default class Home extends Component {

    state = {projectList: []};

    componentDidMount() {
        this.fetchProjectList();
    }

    fetchProjectList = async () => {
        const response = await fetch("http://localhost:5000/api/projects");
        const list = await response.json();
        this.setState({projectList: list});
    };

    render() {
        return (
            <ul>
                {
                    this.state.projectList.map(item => {
                        return <li>{item.projectName}</li>
                    })
                }
            </ul>
        )
    }
}
