<template>
    <div id="container" class="panoramaContent">

    </div>
</template>

<script>
    let scene = '';
    let camera = '';
    let renderer = '';
    let xPositionArr=[];
    let yPositionArr=[];
    let zPositionArr=[];
    let mesh = null;
    let isUserInteracting = false;
    let onPointerDownPointerX = 0;
    let onPointerDownLon = 0;
    let lon=0;
    export default {
        name: "flat",
        computed: {
            imgUrl() {
                let fileUrl=this.$store.state.test.imgFile.fileUrl;
                return fileUrl;
            },
            isSubmit(){
                let isSubmit=this.$store.state.test.isSubmit;
                return isSubmit;
            },
            drawedHotspots(){
                let sum=this.$store.state.test.sum;
                for(let i=0;i<sum.length;i++){
                    let temp=sum[i].imgFile.fileUrl;
                    if(temp[0]==this.imgUrl){
                        return sum[i].hotSpots;
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
                let target=this.$store.state.test.target;
                let sprites=[];
                let k=0;
                for(let i=0,len=children.length;i<len;i++){
                    if(children[i].type.toLowerCase()==='sprite'){
                        let panAndTilt=[-children[i].position.x*2.5,children[i].position.y*2.5];
                        let position=[children[i].position.x,children[i].position.y];
                        sprites.push({'panAndTilt':panAndTilt,'position':position,'target':target[k++]});
                    }
                }
                //提交到state中
                this.$store.dispatch('hotSpots',{sprites:sprites});
            }
        },
        mounted() {
            this.init(this.imgUrl);
            this.animate();
        },

        methods: {
            init(imgurl) {
                if(imgurl.length>1){
                    alert("抱歉，一张图请选择panorama1，六张图请选择panorama6且只支持cubeFaces");
                    return;
                }
                let container = '';
                container = document.getElementById('container');
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, (window.innerWidth-340) / (window.innerHeight-90), 0.1, 600);
                camera.target = new THREE.Vector3(0, 0, 1);
                 camera.position.z=37;
                const geometry = new THREE.PlaneGeometry(80,40);
                const material = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(imgurl[0])
                });
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);

                let draw=this.drawedHotspots;
                for(let i=0,len=draw.length;i<len;i++){
                    let position=draw[i].position;
                    let canvas = document.createElement('canvas');
                    canvas.style.backgroundColor = 'rgba(255,255,255,0)';
                    let context = canvas.getContext('2d');
                    canvas.width = 128;
                    canvas.height = 128;
                    let img = new Image();
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
                        sprite.scale.set(2,2,2);
                        let rate = 1;
                        var endV = new THREE.Vector3(position[0] * rate, position[1] * rate, 0.00001);
                        sprite.position.copy(endV);
                        scene.add(sprite);
                    }

                }

                renderer = new THREE.WebGLRenderer();
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth-340, window.innerHeight-90);
                container.appendChild(renderer.domElement);
                //这里触发
                document.getElementsByTagName('canvas')[0].addEventListener('wheel', this.onDocumentMouseWheel, false);
                window.addEventListener('resize', this.onWindowResize, false);
                document.getElementsByTagName('canvas')[0].addEventListener('mousedown',this.onDocumentMouseDown,false);
            },
            onDocumentMouseDown(event){
                if (this.$store.state.test.imgType === 'Flat') {
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
                            let startV = selected.point;
                            xPositionArr.push(selected.point.x);
                            //console.log("x坐标:" + xPositionArr);
                            yPositionArr.push(selected.point.y);
                            //console.log("y坐标:" + yPositionArr);
                            zPositionArr.push(selected.point.z);
                            //console.log("z坐标:" + zPositionArr);
                        }
                        if (xPositionArr.length == 3) {
                            document.getElementById('container').style.cursor = 'default';
                            this.$store.dispatch('isHotspot');
                            let xAverage = (xPositionArr[0] + xPositionArr[1] + xPositionArr[2]) / 3;
                            let yAverage = (yPositionArr[0] + yPositionArr[1] + yPositionArr[2]) / 3;
                            let zAverage = (zPositionArr[0] + zPositionArr[1] + zPositionArr[2]) / 3;
                            console.log('xAverage'+':'+xAverage+' '+'yAverage: '+yAverage+'zAverage: '+zAverage);
                            let canvas = document.createElement('canvas');
                            canvas.style.backgroundColor = 'rgba(255,255,255,0)';
                            let context = canvas.getContext('2d');
                            canvas.width = 128;
                            canvas.height = 128;
                            let img = new Image();
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
                                sprite.scale.set(2,2,2);
                                let rate = 1;
                                var endV = new THREE.Vector3(xAverage * rate, yAverage * rate, 0.00001);
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
                }

                isUserInteracting = true;
                onPointerDownPointerX = event.clientX;
                onPointerDownLon = lon;
            },
            onDocumentMouseMove(event){
                if (isUserInteracting === true) {
                    lon = (onPointerDownPointerX - event.clientX) * 0.1;
                    mesh.position.x=-lon;
                }
            },
            onDocumentMouseUp(){
              isUserInteracting=false;
            },
            onWindowResize() {
                camera.aspect = (window.innerWidth)/(window.innerHeight);
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            },
            onDocumentMouseWheel(event) {
                camera.fov += event.deltaY * 0.05;
                if(camera.fov>=10&&camera.fov<=150){
                    camera.updateProjectionMatrix();
                }
            },
            animate() {
                if(this.imgUrl.length>1){
                    return;
                }
                this.update();
                requestAnimationFrame(this.animate);

            },
            update() {
                camera.lookAt(camera.target);
                renderer.render(scene, camera);
            }
        }
    };
</script>

<style scoped>

</style>