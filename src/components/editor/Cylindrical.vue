<template>
    <div id="container" class="panoramaContent">

    </div>
</template>

<script>
    let scene = '';
    let camera = '';
    let renderer = '';
    let isUserInteracting = false;
    let lon = 0;
    let lat = 0;
    let onPointerDownPointerX = '';
    let onPointerDownLon = '';
    let onPointerDownPointerY = '';
    let onPointerDownLat = '';
    let phi = 0;
    let theta = 0;
    let xPositionArr=[];
    let yPositionArr=[];
    let zPositionArr=[];
    export default {
        name: "cylindrical",
        computed: {
            imgUrl() {
                let fileUrl = this.$store.state.test.imgFile.fileUrl;
                return fileUrl;
            },
            isSubmit() {
                let isSubmit = this.$store.state.test.isSubmit;
                return isSubmit;
            },
            drawedHotspots() {
                let sum = this.$store.state.test.sum;
                for (let i = 0; i < sum.length; i++) {
                    let temp = sum[i].imgFile.fileUrl;
                    if (temp[0] == this.imgUrl) {
                        return sum[i].hotSpots;
                    }
                }
                return [];
            },
            drawedImgHotSpots() {
                let sum = this.$store.state.test.sum;
                for (let i = 0; i < sum.length; i++) {
                    let temp = sum[i].imgFile.fileUrl;
                    if (temp[0] == this.imgUrl) {
                        return sum[i].imgHotSpots;
                    }
                }
                return [];
            }
        },
        watch: {
            imgUrl(newvalue) {
                document.getElementById('container').innerHTML="";
                this.$store.commit('clearTarget');
                this.$store.commit('clearHotSpots');
                this.$store.commit('clearHotUrl');
                this.$store.commit('clearImgHotSpots');
                this.init(newvalue);
                this.animate();
            },
            //确认提交按钮后触发的事件逻辑,找出所有的热点，注意这里的热点位置信息需要转换(转换关系1.25倍)
            isSubmit(){
                let children=scene.children;
                let imgHotSpots=[];
                let sprites=[];
                let target=this.$store.state.test.target;
                let hotUrl=this.$store.state.test.hotUrl;
                let k=0;
                let m=0;
                for(let i=0,len=children.length;i<len;i++){
                    if(children[i].type.toLowerCase()==='sprite'){
                        let panAndTilt=this.calculatePanandTilt(children[i].position.x*1.25,children[i].position.y*1.25,children[i].position.z*1.25);
                        sprites.push({'panAndTilt':panAndTilt,'position':[children[i].position.x*1.25,children[i].position.y*1.25,children[i].position.z*1.25],'target':target[k++]});
                    }
                    if(children[i].material.type.toLowerCase()==='meshnormalmaterial'){
                        //计算四个点的panandTilt
                        let polyhotspot=[];
                        for(let j=0,len=children[i].geometry.vertices.length;j<len;j++){
                            polyhotspot.push(this.calculatePanandTilt(children[i].geometry.vertices[j].x,children[i].geometry.vertices[j].y,children[i].geometry.vertices[j].z));
                        }
                        //这里的target是用户上传的图片热点图片路径，暂时先写死images/temp.png
                        imgHotSpots.push({'panAndTilt':polyhotspot,'position':children[i].geometry.vertices,'target':null,'hotUrl':hotUrl[m++]});

                    }

                }
                //提交到state中
                this.$store.dispatch('hotSpots',{sprites:sprites});
                this.$store.dispatch('imgHotSpots',{imgHotSpots:imgHotSpots});
            }
        },
        mounted() {
            this.init(this.imgUrl);
            this.animate();
        },

        methods: {
            init(imgurl) {
                if (imgurl.length > 1) {
                    alert("抱歉，一张图请选择panorama1，六张图请选择panorama6且只支持cubeFaces");
                    return;
                }
                let container = '';
                let mesh = '';
                container = document.getElementById('container');
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 340) / (window.innerHeight - 90), 1, 1100);
                camera.target = new THREE.Vector3(0, 0, 0);
                const geometry = new THREE.CylinderGeometry(500, 500, 500 * Math.PI, 60, 40);
                geometry.scale(-1, 1, 1);
                const material = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(imgurl[0])
                });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);

                let draw=this.drawedHotspots;
                for(let i=0,len=draw.length;i<len;i++){
                    let position=draw[i].position;
                    let canvas = document.createElement('canvas');
                    canvas.style.backgroundColor='rgba(255,255,255,0)';
                    let context = canvas.getContext('2d');
                    canvas.width = 128;
                    canvas.height = 128;
                    var img = new Image();
                    //这里发布的时候会出现http://localhost:8083/web/dist/static/textures/hotspot.svg
                    img.src = 'static/textures/hotspot.svg';
                    img.onload=function () {
                        context.drawImage(img,0,0);
                        let texture = new THREE.Texture(canvas);
                        texture.needsUpdate = true;
                        texture.minFilter = THREE.LinearFilter;
                        var spriteMaterial = new THREE.SpriteMaterial({
                            map: texture,
                            transparent: false
                        });
                        var sprite = new THREE.Sprite(spriteMaterial);
                        sprite.scale.set(30, 30, 30);
                        let rate = 0.8;
                        var endV=new THREE.Vector3(position[0]*rate,position[1]*rate,position[2]*rate);
                        sprite.position.copy(endV);
                        scene.add(sprite);
                    }

                }
                //画已经保存的图片热点
                let drawedImgHotSpots=this.drawedImgHotSpots;
                for(let j=0,len=drawedImgHotSpots.length;j<len;j++){
                    let position=drawedImgHotSpots[j].position;
                    let v1=new THREE.Vector3(position[0].x,position[0].y,position[0].z);
                    let v2=new THREE.Vector3(position[1].x,position[1].y,position[1].z);
                    let v3=new THREE.Vector3(position[2].x,position[2].y,position[2].z);
                    let v4=new THREE.Vector3(position[3].x,position[3].y,position[3].z);
                    //画三角面片
                    let geom = new THREE.Geometry();
                    geom.vertices.push(v1);
                    geom.vertices.push(v2);
                    geom.vertices.push(v3);
                    geom.vertices.push(v4);
                    geom.faces.push( new THREE.Face3( 0, 1, 2) );
                    geom.faces.push(new THREE.Face3(2,3,0));
                    geom.computeFaceNormals();
                    let object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
                    scene.add(object);
                }


                renderer = new THREE.WebGLRenderer();
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth - 340, window.innerHeight - 90);
                container.appendChild(renderer.domElement);
                document.getElementsByTagName('canvas')[0].addEventListener('mousedown', this.onDocumentMouseDown, false);
                document.getElementsByTagName('canvas')[0].addEventListener('mousemove', this.onDocumentMouseMove, false);
                document.getElementsByTagName('canvas')[0].addEventListener('mouseup', this.onDocumentMouseUp, false);
                document.getElementsByTagName('canvas')[0].addEventListener('wheel', this.onDocumentMouseWheel, false);

                window.addEventListener('resize', this.onWindowResize, false);
            },
            onWindowResize() {
                camera.aspect = (window.innerWidth - 340) / (window.innerHeight - 90);
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth - 340, window.innerHeight - 90);
            },
            onDocumentMouseDown(event) {
                if (this.$store.state.test.imgType === 'Cylindrical') {
                    event.preventDefault();
                    let vector = new THREE.Vector3();//三维坐标对象
                    vector.set(
                        //注意：这里是根据render的size来确定的
                        ((event.clientX - 320) / (window.innerWidth - 340)) * 2 - 1,
                        -((event.clientY - 70) / (window.innerHeight - 90)) * 2 + 1,
                        0.5);
                    vector.unproject(camera);
                    let raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
                    let intersects = raycaster.intersectObjects(scene.children);
                    //如果绘制热点属于激活状态
                    if (this.$store.state.test.isHotspot) {
                        if (intersects.length > 0) {
                            var selected = intersects[0];//取第一个物体
                            console.log(intersects);
                            xPositionArr.push(selected.point.x);
                            yPositionArr.push(selected.point.y);
                            zPositionArr.push(selected.point.z);
                        }
                        if (xPositionArr.length == 3) {
                            document.getElementById('container').style.cursor = 'default';
                            this.$store.dispatch('isHotspot');
                            let xAverage = (xPositionArr[0] + xPositionArr[1] + xPositionArr[2]) / 3;
                            let yAverage = (yPositionArr[0] + yPositionArr[1] + yPositionArr[2]) / 3;
                            let zAverage = (zPositionArr[0] + zPositionArr[1] + zPositionArr[2]) / 3;
                            let canvas = document.createElement('canvas');
                            canvas.style.backgroundColor = 'rgba(255,255,255,0)';
                            let context = canvas.getContext('2d');
                            canvas.width = 128;
                            canvas.height = 128;
                            var img = new Image();
                            img.src = 'static/textures/hotspot.svg';
                            img.onload = function () {
                                context.drawImage(img, 0, 0);
                                let texture = new THREE.Texture(canvas);
                                texture.needsUpdate = true;
                                texture.minFilter = THREE.LinearFilter;
                                var spriteMaterial = new THREE.SpriteMaterial({
                                    map: texture,
                                    transparent: false
                                });
                                var sprite = new THREE.Sprite(spriteMaterial);
                                sprite.scale.set(30, 30, 30);
                                let rate = 0.8;
                                var endV = new THREE.Vector3(xAverage * rate, yAverage * rate, zAverage * rate);
                                sprite.position.copy(endV);
                                scene.add(sprite);
                            }

                            xPositionArr = [];
                            yPositionArr = [];
                            zPositionArr = [];
                        }
                        //移除热点
                    } else {
                        if (intersects.length > 0) {
                            const target = intersects[0];
                            try {
                                if (target.object && target.object.type.length > 0) {
                                    if (target.object.type.toLowerCase() == "sprite") {
                                        scene.remove(target.object);
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                    if (this.$store.state.test.isImageHotspot) {
                        if (intersects.length > 0) {
                            var selected = intersects[0];//取第一个物体
                            var startV=selected.point;
                            xPositionArr.push(selected.point.x);
                            //console.log("x坐标:" + xPositionArr);
                            yPositionArr.push(selected.point.y);
                            //console.log("y坐标:" + yPositionArr);
                            zPositionArr.push(selected.point.z);
                            //console.log("z坐标:" + zPositionArr);
                        }
                        //画点
                        if(xPositionArr.length==1){
                            let geom = new THREE.Geometry();
                            let material = new THREE.PointsMaterial({
                                color: 0x0000ff,
                                size:10
                            });
                            geom.vertices.push(new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]));
                            let point =  new THREE.Points(geom, material);
                            scene.add(point);
                        }
                        //画线
                        if(xPositionArr.length==2){
                            //粒子
                            let geom = new THREE.Geometry();
                            let material = new THREE.ParticleBasicMaterial({
                                color: 0x0000ff,
                                size:10
                            });
                            //geom.vertices.push(new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]));
                            geom.vertices.push(new THREE.Vector3(xPositionArr[1],yPositionArr[1],zPositionArr[1]));
                            let point =  new THREE.Points(geom, material);
                            scene.add(point);
                            //线
                            let line=new THREE.Geometry();
                            line.vertices.push(new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]));
                            line.vertices.push(new THREE.Vector3(xPositionArr[1],yPositionArr[1],zPositionArr[1]));
                            let mesh = new THREE.Line( line, material, THREE.LineSegments );
                            scene.add(mesh);
                        }
                        //画三角形
                        if(xPositionArr.length==3){
                            //粒子
                            let geom = new THREE.Geometry();
                            let material = new THREE.ParticleBasicMaterial({
                                color: 0x0000ff,
                                size:10
                            });
                            //geom.vertices.push(new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]));
                            geom.vertices.push(new THREE.Vector3(xPositionArr[2],yPositionArr[2],zPositionArr[2]));
                            let point =  new THREE.Points(geom, material);
                            scene.add(point);
                            //线
                            let line1=new THREE.Geometry();
                            line1.vertices.push(new THREE.Vector3(xPositionArr[1],yPositionArr[1],zPositionArr[1]));
                            line1.vertices.push(new THREE.Vector3(xPositionArr[2],yPositionArr[2],zPositionArr[2]));
                            let mesh1 = new THREE.Line( line1, material, THREE.LineSegments );
                            scene.add(mesh1);
                            let line2=new THREE.Geometry();
                            line2.vertices.push(new THREE.Vector3(xPositionArr[2],yPositionArr[2],zPositionArr[2]));
                            line2.vertices.push(new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]));
                            let mesh2 = new THREE.Line( line2, material, THREE.LineSegments );
                            scene.add(mesh2);

                        }
                        if (xPositionArr.length == 4) {
                            document.getElementById('container').style.cursor = 'default';
                            this.$store.dispatch('isImageHotspot');
                            //将之前的点和线删除
                            let children=scene.children;
                            for(let i=0;i<children.length;i++){
                                if((children[i].type.toLowerCase()==='points')||(children[i].type.toLowerCase()==='line')){
                                    scene.remove(children[i]);
                                    i--;
                                }

                            }
                            var v1=new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]);
                            var v2=new THREE.Vector3(xPositionArr[1],yPositionArr[1],zPositionArr[1]);
                            var v3=new THREE.Vector3(xPositionArr[2],yPositionArr[2],zPositionArr[2]);
                            var v4=new THREE.Vector3(xPositionArr[3],yPositionArr[3],zPositionArr[3]);
                            //画三角面片
                            var geom = new THREE.Geometry();
                            geom.vertices.push(v1);
                            geom.vertices.push(v2);
                            geom.vertices.push(v3);
                            geom.vertices.push(v4);
                            geom.faces.push( new THREE.Face3( 0, 1, 2) );
                            geom.faces.push(new THREE.Face3(2,3,0));
                            geom.computeFaceNormals();
                            var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
                            scene.add(object);
                            xPositionArr = [];
                            yPositionArr = [];
                            zPositionArr = [];
                            console.log(scene);
                        }
                        //移除热点
                    }else{
                        if(intersects.length>0){
                            const target = intersects[0];
                            try {
                                if(target.object&&target.object.type.length>0){
                                    if(target.object.material.type.toLowerCase()=="meshnormalmaterial"){
                                        scene.remove(target.object);
                                    }
                                }
                            }catch(e){
                                console.log(e);
                            }
                        }
                    }
                }

                isUserInteracting = true;
                onPointerDownPointerX = event.clientX;
                onPointerDownPointerY = event.clientY;
                onPointerDownLon = lon;
                onPointerDownLat = lat;
            },
            onDocumentMouseMove(event) {
                if (isUserInteracting === true) {
                    lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
                    lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
                }
            },
            onDocumentMouseUp() {
                isUserInteracting = false;
                // camera.fov += event.deltaY * 0.05;
            },
            onDocumentMouseWheel(event) {
                camera.fov += event.deltaY * 0.05;
                if(camera.fov>=10&&camera.fov<=150){
                    camera.updateProjectionMatrix();
                }
            },
            animate() {
                //暂时指定只能支持一张图片
                if (this.imgUrl.length > 1) {
                    return;
                }
                this.update();
                requestAnimationFrame(this.animate);

            },
            update() {
                //控制自动旋转速度
                if (isUserInteracting === false) {
                    lon += 0;
                }
                lat = Math.max(-85, Math.min(85, lat));
                phi = THREE.Math.degToRad(90 - lat);
                theta = THREE.Math.degToRad(lon);
                camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
                camera.target.y = 500 * Math.cos(phi);
                camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
                camera.lookAt(camera.target);
                renderer.render(scene, camera);

            },
            calculatePanandTilt(xAverage, yAverage, zAverage) {
                let pan = 0;
                let tilt = 0;
                //计算出配置文件中热点的位置
                if ((xAverage) < 0 && zAverage < 0) {
                    pan = Math.asin(-xAverage / (500)) * 180 / Math.PI;
                }
                if ((xAverage) > 0 && zAverage < 0) {
                    pan = Math.asin(-xAverage / (500)) * 180 / Math.PI;
                }
                if ((xAverage) > 0 && zAverage >= 0) {
                    pan = Math.asin(xAverage / (500)) * 180 / Math.PI - 180;
                }
                if ((xAverage) < 0 && zAverage > 0) {
                    pan = Math.asin(xAverage / (500)) * 180 / Math.PI + 180;
                }
                tilt = Math.atan(yAverage / 500) * 180 / Math.PI;
                console.log('pan: ' + pan);
                console.log('tilt: ' + tilt);
                return [pan,tilt];
            }

        }

    };
</script>

<style scoped>

</style>