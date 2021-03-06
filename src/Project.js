import React, {Component} from 'react';
import fetch from 'isomorphic-fetch'
import {Link} from "react-router-dom";
import UploadCsv from "./UploadCsv";
import UploadVideo from "./UploadVideo"

// const fetchUrl = "http://localhost:5000/api/project";
const fetchUrl = "https://mm360-server.herokuapp.com/api/project";

export default class Project extends Component {

    state = {
        isLoaded: false,
        data: []
    };

    componentDidMount() {
        console.log(this.props.match.params.projectName);
        console.log(this.state);
        this.fetchProjectData();
        this.fetchSensorData();
    }

    fetchProjectData = async () => {
        const response = await fetch(`${fetchUrl}/${this.props.match.params.projectName}`);
        const json = await response.json();
        this.setState({
            isLoaded: true,
            data: json
        });
        console.log(JSON.stringify(json));
    };

    fetchSensorData = async () => {
        const response = await fetch(`${fetchUrl}/${this.props.match.params.projectName}/sensor`);
        const json = await response.json();
        console.log(json);
    };

    createVideoPathItem = (v) => {
        return ( <p key={v.path}>{v.path}</p> )
    };

    render() {
        // debugger
        if (!this.state.isLoaded) {
            return (<p>loading...</p>)
        }

        if (this.state.data.length <= 0) {
            return (<p>not found</p>)
        }

        const data = this.state.data[0];
        console.log(data);
        if (data.dataPath === "") {
            return (
                <div>
                    <h1>{data.projectName}</h1>
                    <p>require sensor data</p>
                    <UploadCsv name={this.props.match.params.projectName} />
                </div>
            )
        }

        if (data.pointVideoPathList.length <= 0) {
            return (
                <div>
                    { this.createUploadVideoBlock(data) }
                </div>
            )
        } else {
            return (
                <div>
                    <h1>{data.projectName}</h1>
                    <h2><Link to={`${process.env.PUBLIC_URL}/panorama/${this.props.match.params.projectName}`} >Open Panoramic View</Link></h2>
                    { this.createUploadVideoBlock(data) }
                </div>
            )
        }

        // return (
        //     <div>
        //         <h1>{data.projectName}</h1>
        //         {/*<h2><Link to={`/project/${this.props.match.params.projectName}/panoramic`} >Open Panoramic View</Link></h2>*/}
        //         <h2><Link to={`${process.env.PUBLIC_URL}/panorama/${this.props.match.params.projectName}`} >Open Panoramic View</Link></h2>
        //         <p>sensor was uploaded</p>
        //         <p>video was uploaded</p>
        //         <h3>Uploaded Video List</h3>
        //         { data.pointVideoPathList.map(this.createVideoPathItem) }
        //     </div>
        // )
    }

    createUploadVideoBlock = (data) => {
        return (
            <div>
                <p>sensor was uploaded</p>
                <p>require video data</p>
                <UploadVideo name={this.props.match.params.projectName} data={data} />
            </div>
        )
    };

}
