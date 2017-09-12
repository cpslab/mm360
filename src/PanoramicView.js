import React, {Component} from 'react';
import fetch from 'isomorphic-fetch'
import * as THREE from 'three';
import ThreeOrbitControls from 'three-orbit-controls';

// const rootUrl = 'http://localhost:5000';
const rootUrl = 'https://mm360-server.herokuapp.com';

const OrbitControls = new ThreeOrbitControls(THREE);

export default class PanoramicView extends Component {

    DEBUG = false;

    frame = 0;

    scene = new THREE.Scene();

    loader = new THREE.TextureLoader();

    video = document.createElement('video');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);

    renderer = new THREE.WebGLRenderer();

    sphere;

    controls;

    mouse = {x: 0, y: 0};

    currentTime = 0;

    data;

    currentId;

    linkMap = new Map();

    gpsIndex = 0;

    render() {
        return (  <div id="stage"></div> );
    }

    componentDidMount() {
        window.onmousedown = this.onMouseDown;
        this.init();
    }

    onMouseDown = (e) => {
        const index = Math.floor(this.video.currentTime);
        const now = this.currentData(this.currentId);
        const timestamp = now.sensorData[index].timestamp;

        const ray = this.getMouseRay(e);
        const isMeshClick = this.isMeshClick(ray);
        console.log(isMeshClick);


        if (isMeshClick) {
            this.changeVideo(this.currentData(this.currentId).path, timestamp);
            this.clearLink();
            this.addLink(this.video.currentTime);
        }
    };

    init = async () => {
        this.data = await this.fetchSensorData();
        this.currentId = this.data[0].id;
        console.log(this.data);
        this.main();
    };

    fetchSensorData = async () => {
        const url = `${rootUrl}/api/project/${this.props.match.params.projectName}/sensor`;
        console.log(`url: ${url}`);
        const response = await fetch(url);
        return await response.json();
    };

    main = () => {
        this.setupVideo();
        this.setupMesh(this.video);
        this.addLink(0);
        this.setupThreeRenderer();
        // this.threeRender();
        window.requestAnimationFrame(this.threeRender);
        // window.onmousedown = this.onMouseClick();
    };

    setupVideo = () => {
        this.video.id = 'id';
        this.video.width = 640;
        this.video.height = 360;
        this.video.autoplay = false;
        this.video.loop = false;
        this.video.crossOrigin = '';
        this.video.src = this.currentData(this.currentId).path
        // this.video.src = '/theta1.mp4';
        this.video.addEventListener('loadeddata', () => { this.video.play(); });
        console.log(this.video.src);
    };

    setupMesh = (video) => {
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;

        const material = new THREE.MeshBasicMaterial({ map: texture });

        const sphereGeometry = new THREE.SphereGeometry(10, 120, 80);
        sphereGeometry.scale(-1, 1, 1);

        this.sphere = new THREE.Mesh(sphereGeometry, material);
        this.scene.add(this.sphere);
        this.sphere.rotation.y = this.radian(this.firstAttitude());
    };

    setupThreeRenderer = () => {
        this.camera.position.set(0, 0, 0.1);
        this.camera.lookAt(this.sphere.position);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor({ color: 0x000000 });
        document.getElementById('stage').appendChild(this.renderer.domElement);
        this.renderer.render(this.scene, this.camera);

        this.controls = new OrbitControls(this.camera);
    };

    addLink = (timeValue) => {
        const time = timeValue === undefined ? 0 : timeValue;
        const index = Math.floor(time);

        console.log(index);

        const target = this.currentData(this.currentId);
        target.sensorData[index].links.forEach(link => {
            const mesh = this.createLinkIconMesh(
                this.validateTheta(link.theta, this.correctionTheta(target, index)), 90);
            this.linkMap.set(link.id, mesh);
            this.scene.add(mesh);
        });
    };

    clearLink = () => {
        this.linkMap.forEach(v => {
            this.removeMesh(v);
        });
        this.linkMap.clear()
    };

    removeMesh = (mesh) => {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    };

    createLinkIconMesh = (theta, phi) => {
        const iconMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 1.5),
            new THREE.MeshBasicMaterial({
                map: this.loader.load(`${process.env.PUBLIC_URL}/arrow_icon.png`),
                alphaTest: 0.2 })
        );

        this.setIconPosition(iconMesh, theta, phi);
        return iconMesh;
    };

    setIconPosition = (target, thetaValue, phiValue) => {
        const theta = this.radian(thetaValue);
        const phi = this.radian(phiValue);

        const r = 9.5;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const z = r * Math.sin(phi) * Math.sin(theta);
        const y = r * Math.cos(phi);

        target.position.set(x, y, z);
        target.lookAt(new THREE.Vector3(0, 0, 0));
    };

    checkLink = () => {
        const data = this.currentData(this.currentId);
        const index = Math.floor(this.video.currentTime);
        const deleteLInkIds = [];
        this.linkMap.forEach((v, k) => {
            let isLinkActive = false;
            data.sensorData[index].links.forEach(link => {
                if (link.id === k) {
                    isLinkActive = true;
                }
            });

            if (!isLinkActive) {
                deleteLInkIds.push(k);
            }
        });

        deleteLInkIds.forEach(id => {
            this.removeMesh(this.linkMap.get(id));
            this.linkMap.delete(id);
        })
    };

    isMeshClick = (ray) => {
        let isClick = false;
        this.linkMap.forEach(mesh => {
            const icon = ray.intersectObjects([mesh]);
            if (icon.length <= 0) {
                return;
            }

            this.gpsIndex = 0;
            this.linkMap.forEach((v, k) => {
                if (v === mesh) {
                    this.currentId = k;
                }
            });
            this.sphere.rotation.y = this.radian(this.firstAttitude());

            isClick = true;
        });

        return isClick;
    };

    threeRender = () => {
        window.addEventListener('resize', this.onWindowResize, false);

        // TODO:
        this.frame++;
        if (this.frame % 15 === 0 && !this.DEBUG) {
            this.frame = 0;
            this.checkLink();
            this.loadGps();

            // console.log(this.video.currentTime);
        }

        this.renderer.render(this.scene, this.camera);
        this.controls.update();

        window.requestAnimationFrame(this.threeRender);
    };

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    loadGps = () => {
        if (this.gpsIndex > 100) {
            this.gpsIndex = 0;
        }

        const index = Math.floor(this.video.currentTime);
        const now = this.currentData(this.currentId);
        const links = now.sensorData[index].links;

        links.forEach(link => {
            if (!this.linkMap.has(link.id)) {
                this.addLink(index);
                return;
            }

            const theta = this.validateTheta(link.theta, this.correctionTheta(now, index));
            this.setIconPosition(this.linkMap.get(link.id), theta, 90);
        })
    };

    getMouseRay = (e) => {
        if (e.target !== this.renderer.domElement) {
            return;
        }

        // マウス座標2D変換
        const rect = e.target.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // マウス座標3D変換 width（横）やheight（縦）は画面サイズ
        this.mouse.x = ((this.mouse.x / window.innerWidth) * 2) - 1;
        this.mouse.y = -((this.mouse.y / window.innerHeight) * 2) + 1;

        // マウスベクトル
        const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1);

        // vector はスクリーン座標系なので, オブジェクトの座標系に変換
        vector.unproject(this.camera);

        // 始点, 向きベクトルを渡してレイを作成
        return new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
    };

    radian = (degree) => {
        return -1 * parseFloat(degree) * Math.PI / 180;
    };



    correctionTheta = (target, index) => {
        return parseFloat(target.sensorData[index].attitude.theta);
    };

    firstAttitude = () => {
        return this.correctionTheta(this.currentData(this.currentId), 0)
    };

    currentData = (id) => {
        return this.data.filter(x => x.id === id)[0];
    };

    validateTheta = (linkTheta, cameraTheta) => {
        let calc = parseFloat(linkTheta) + (this.firstAttitude() - parseFloat(cameraTheta));

        if (calc < 0) {
            calc -= 360;
        }

        if (calc > 360) {
            calc -= 360;
        }

        return calc;
    };

    changeVideo = (src, timestamp) => {
        console.log(`video src: ${src}`);
        const time = this.fetchAfterChangeVideoTime(timestamp);
        console.log(`after changing video time: ${time}`);
        this.currentTime = time;
        this.video.src = src;
        this.video.removeEventListener('loadeddata', this.seekTime);
        this.video.addEventListener('loadeddata', this.seekTime);
    };

    fetchAfterChangeVideoTime = (timestamp) => {
        const now = this.currentData(this.currentId);
        for (let i = 0; i < now.sensorData.length; i++) {
            console.log(`now: ${now.sensorData[i].timestamp}, timestamp: ${timestamp}`);
            if (now.sensorData[i].timestamp === timestamp) {
                console.log("return if timestamp");
                return i;
            }
        }

        console.log("video.currentTime");
        return this.video.currentTime;
    };

    seekTime = () => {
        this.video.currentTime = this.currentTime;
    }

}
