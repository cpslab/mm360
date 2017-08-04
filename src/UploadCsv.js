import React, { Component } from 'react';
import './App.css';
import fetch from 'isomorphic-fetch'
import queryString from 'query-string'

const endpoint = "http://localhost:5000/api/project";

export default class UploadCsv extends Component {

    state = { isPosting: false };

    componentDidMount() {
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        // console.log(this.state.formData);
        let postData = "";
        this.state.formData.forEach(v => {
            postData += v;
            postData += ";";
        });
        const postUrl = `${endpoint}/${this.props.name}/sensor`;
        const response = await fetch(postUrl, {
            method: "POST",
            body: postData
        });
        this.setState({ isPosting: false });

        const result = await response.text();
        if (result === "success") {
            window.location.reload()
        } else {
            alert("upload error");
        }
    };

    handleFile = (e) => {
        const formData = [];
        const files = Array.from(e.target.files);

        for (const name in files) {
            const reader = new FileReader();
            reader.readAsText(files[name]);

            reader.onload = () => {
                // formData.append(name, reader.result);
                formData.push(reader.result.trim());
                this.setState({ formData: formData });
            };
        }
    };

    render() {

        return (
            <div>
                <form id="sensors" name="sensors" onSubmit={this.handleSubmit} encType="multipart/form-data">
                    <input type="file" multiple="multiple" onChange={this.handleFile} />
                    <input type="submit" value="Upload" />
                </form>
                <p>{this.state.isPosting ? "progress..." : ""}</p>
            </div>

        )
    }
}
