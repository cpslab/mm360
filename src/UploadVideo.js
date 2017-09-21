import React, { Component } from 'react';
import './App.css';
import fetch from 'isomorphic-fetch'
import { GoogleMap, Marker, withGoogleMap } from "react-google-maps";

// const endpoint = "http://localhost:5000";
const endpoint = "https://mm360-server.herokuapp.com";

const policyRootUrl = `${endpoint}/api/policy`;

const projectUrl = `${endpoint}/api/project`;

export default class UploadVideo extends Component {

    state = {
        isPosting: false,
        isFileLoading: false,
        isLoading: true,
        uploadUrlList: [],
        uploadedVideoUrlList: []
    };

    componentDidMount() {
        console.log(`upload video:`);
        console.log(this.props.data);
        this.fetchUploadUrlList();
    }

    fetchUploadUrlList = async () => {
        console.log(`${projectUrl}/${this.props.name}/pre-signed-url-list`);
        const response = await fetch(`${projectUrl}/${this.props.name}/pre-signed-url-list`);
        const json = await response.json();
        this.setState({
            uploadUrlList: json,
            isLoading: false
        });
    };

    postUploadedVideo = async (id, path) => {
        fetch(`${projectUrl}/${this.props.name}/video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({ id: parseInt(id), path: path })
        })
    };

    handleSubmit = async (e, url, pointId) => {
        e.preventDefault();

        console.log(url);
        this.setState({ isPosting: true });

        const response = await fetch(url, {
            method: 'PUT',
            body: this.state.file,
            headers: {
                "Content-Type": this.state.file.type
            }
        });
        const text = await response.text();
        console.log(`status code: ${response.status}, result: ${text}`);
        if (response.status === 200) {
            const index = url.indexOf("?");
            const accessUrl = url.substring(0, index);
            // this.state.uploadedVideoUrlList.push({ id: pointId, path: accessUrl });
            await this.postUploadedVideo(pointId, accessUrl);
            console.log(accessUrl);
        } else {
            alert('upload error')
        }
        this.setState({ isPosting: false })
    };

    handleFile = (e) => {
        const reader = new FileReader();
        const file = e.target.files[0];

        this.setState({ isFileLoading: true });
        reader.onload = async () => {
            // const param = {
            //     project_name: this.props.name,
            //     filename: file.name,
            //     content_type: file.type
            // };
            //
            // const policyUrl = policyRootUrl + "?" + queryString.stringify(param);
            // console.log(policyUrl);
            // const url = await (await fetch(policyUrl)).text();

            this.setState({
                isFileLoading: false,
                file: file
            });
        };

        reader.readAsDataURL(file);
    };

    handleSubmitComplete = async () => {
        console.log('handle submit complete');
        console.log(this.state.uploadedVideoUrlList);
        const response = await fetch(`${projectUrl}/${this.props.name}`);
        const json = await response.json();
        const data = json[0];

        console.log(data);
        console.log(data.pointVideoPathList);
        this.state.uploadedVideoUrlList.forEach(v => {
                data.pointVideoPathList.push(v);
        });
        console.log(data);

        const updateResponse = await fetch(`${projectUrl}/${this.props.name}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(data)
        });
        const result = await updateResponse.text();

        if (updateResponse.status === 200) {
            window.location.reload()
        } else {
            console.log(`result: ${result}, status code: ${updateResponse.status}`);
            console.log(updateResponse);
            alert("error");
        }
    };

    render() {
        return (
            <div className="App">
                { this.createUploadVideoBlock() }
            </div>
        )
    }

    createUploadVideoBlock = () => {
        if (this.state.isLoading) {
            return <p>loading...</p>
        }

        if (this.state.isPosting) {
            return <p>uploading...</p>
        }

        return (
            <div style={{ width: "80%", margin: "auto" }}>
                <button onClick={this.handleSubmitComplete}>Upload Complete</button>
                <br/>
                { this.state.uploadUrlList.map(this.createUploadItem) }
            </div>
        )
    };

    createUploadedVideoItem = (videoUrl) => {
        if (videoUrl === undefined || videoUrl === "") {
            return (
                <div>
                    <p>uploaded video</p>
                    <p>no data</p>
                </div>
            )
        }

        return (
            <div>
                <p>uploaded video</p>
                <video width={300} src={videoUrl} alt={videoUrl} />
            </div>
        )
    };

    createUploadItem = (item) => {
        console.log(item);
        return (
            <div style={{ width: 300, float: "left", margin: 16 }} className="upload-video-item">
                <h3>point{item.pointId}</h3>
                <form onSubmit={e => this.handleSubmit(e, item.preSignedUploadUrl, item.pointId)} encType="multipart/form-data">
                    <input type="file" onChange={this.handleFile} />
                    <input disabled={this.state.isPosting || this.state.isFileLoading } className='btn btn-primary' type="submit" value="Upload" />
                </form>
                <p>{this.state.isPosting || this.state.isFileLoading ? "waiting..." : ""}</p>
                <p>{item.pointGps.latitude} / {item.pointGps.longitude}</p>
                {this.createGoogleMap(item)}
                { this.createUploadedVideoItem(item.uploadedUrl) }
                <br/>
            </div>
        );
    };

    createGoogleMap = (item) => {
        console.log(`lat: ${item.pointGps.latitude}, lng: ${item.pointGps.longitude}`);
        const PointGoogleMap = withGoogleMap(props => (
            <GoogleMap
                defaultZoom={18}
                defaultCenter={{ lat: props.lat, lng: props.lng }}
            >
                {props.markers.map((marker, index) => (
                    <Marker
                        {...marker}
                    />
                ))}
            </GoogleMap>
        ));

        const markerData = [{
            position: {
                lat: item.pointGps.latitude,
                lng: item.pointGps.longitude,
            },
            key: `Japan`,
        }];

        return (
            <div style={{ height: 300, width: 300 }}>
                <PointGoogleMap
                    containerElement={
                        <div style={{ height: `100%` }} />
                    }
                    mapElement={
                        <div style={{ height: `100%` }} />
                    }
                    markers={markerData}
                    lat={item.pointGps.latitude}
                    lng={item.pointGps.longitude}
                />
            </div>
        )
    };
}