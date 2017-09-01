import React, { Component } from 'react';
import './App.css';
import fetch from 'isomorphic-fetch'
import queryString from 'query-string'
import moment from 'moment'

// const endpoint = "http://localhost:5000/api/project";
const endpoint = "https://rocky-woodland-39339.herokuapp.com//api/project";

export default class UploadCsv extends Component {

    state = { isPosting: false };

    componentDidMount() {
    }

    createData = (index, csv) => {
        const data = {};

        data.id = `video${index}`;
        data.path = `theta${index}.mp4`;

        const array = csv.trim().split('\n').map(x => x.split(','));
        array.shift();
        const sensorData = [];
        let beforeTime = moment(0);
        array.forEach(x => {
            const unixTime = parseInt(x[0]);
            if (unixTime === 0) {
                return;
            }

            const time = moment(unixTime);
            if (time.second() === beforeTime.second()) {
                return;
            }
            beforeTime = time;

            sensorData.push(this.createJsonItem(x))
        });

        data.sensorData = sensorData;

        return data;
    };

    createJsonItem = (x) => {
        const item = {};

        item.unixtime = x[0];
        item.timestamp = x[1];
        item.links = [];

        const gpsObj = {};
        gpsObj.latitude = parseFloat(x[2]);
        gpsObj.longitude = parseFloat(x[3]);
        gpsObj.altitude = parseFloat(x[4]);
        item.gps = gpsObj;

        const attObj = {};
        attObj.theta = parseFloat(x[7]);
        attObj.pitchX = parseFloat(x[8]);
        attObj.rollY = parseFloat(x[9]);
        attObj.orientation = parseFloat(x[10]);
        item.attitude = attObj;

        return item
    };

    calcGps = (point1, point2) => {
        const maxIndex = Math.min(point1.sensorData.length, point2.sensorData.length) - 1;
        for (let i = 0; i < maxIndex; i++) {
            const linkData = this.geoDirection(point2.id, point1.sensorData[i].gps, point2.sensorData[i].gps);
            point1.sensorData[i].links.push(linkData);
        }
    };

    radian = (degree) => {
        return degree * Math.PI / 180;
    };

    geoDirection = (targetId, point1, point2) => {
        const r = 6378137;			// 地球の赤道半径

        let lat1 = point1.latitude;
        let lng1 = point1.longitude;
        let alt1 = point1.altitude;
        let lat2 = point2.latitude;
        let lng2 = point2.longitude;
        let alt2 = point2.altitude;

        // 緯度経度 lat1, lng1 の点を出発として、緯度経度 lat2, lng2 への方位
        // 北を０度で右回りの角度０～３６０度
        var Y = Math.cos(lng2 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180 - lat1 * Math.PI / 180);
        var X = Math.cos(lng1 * Math.PI / 180) * Math.sin(lng2 * Math.PI / 180) - Math.sin(lng1 * Math.PI / 180) * Math.cos(lng2 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180 - lat1 * Math.PI / 180);
        var dirE0 = 180 * Math.atan2(Y, X) / Math.PI; // 東向きが０度の方向
        if (dirE0 < 0) {
            dirE0 = dirE0 + 360; //0～360 にする。
        }
        var dirN0 = (dirE0 + 180) % 360; //(dirE0+90)÷360の余りを出力 北向きが０度の方向

        lat1 = this.radian(lat1);
        lat2 = this.radian(lat2);
        lng1 = this.radian(lng1);
        lng2 = this.radian(lng2);
        const distance = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1));
        const phi = 180 * Math.atan2(alt2 - alt1, distance) / Math.PI;

        const linkData = {};
        linkData.id = targetId;
        linkData.theta = dirN0;
        linkData.distance = distance;
        linkData.phi = phi;

        return linkData;
    };

    generateLinks = (data) => {
        data.forEach(target => {
            data.filter(v => v.id !== target.id)
                .forEach(it => this.calcGps(target, it));
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        // console.log(this.state.formData);
        let postData = [];
        this.state.formData.forEach((v, i) => {
            postData.push(this.createData(i, v));
        });
        this.generateLinks(postData);
        console.log(postData);

        const postUrl = `${endpoint}/${this.props.name}/sensor`;
        const response = await fetch(postUrl, {
            method: "POST",
            body: JSON.stringify(postData),
            headers: {
                "Content-Type": "application/json"
            }
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
