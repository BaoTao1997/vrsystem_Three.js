<template>
    <div id="container" class="panoramaContent">

    </div>
</template>

<script>
    let scene = '';
    let camera = '';
    let renderer = '';
    let controls='';
    let xPositionArr=[];
    let yPositionArr=[];
    let zPositionArr=[];
    let tempXPositonArr=[];
    let tempYPositonArr=[];
    let tempZPositonArr=[];


    //用于6张图的情况
    var texture_placeholder,
        isUserInteracting = false,
        onPointerDownPointerX = 0, onPointerDownPointerY = 0,
        lon =0, onPointerDownLon = 0,
        lat = 0, onPointerDownLat = 0,
        phi = 0, theta = 0,
        target = new THREE.Vector3();
    export default {
        name: "cube-faces",
        computed: {
            imgUrl() {
                // let fileUrl=this.$store.state.test.imgFile.fileUrl;
                //为了方便调试，先将路径写死
                let fileUrl=this.$store.state.test.imgFile.tempfileUrl;
                return fileUrl;
            },
            isSubmit(){
                let isSubmit=this.$store.state.test.isSubmit;
                return isSubmit;
            }

        },
        watch: {
            imgUrl(newvalue) {
                document.getElementById('container').innerHTML="";
                    this.init(newvalue);
                    this.animate();


            },
            isSubmit(){
                let children=scene.children;
                let sprites=[];
                for(let i=0,len=children.length;i<len;i++){
                    if(children[i].type.toLowerCase()==='sprite'){
                        sprites.push(children[i].addition);
                        sprites.push(children[i]);
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
                if(imgurl.length===1) {
                    var container = document.getElementById('container');
                    renderer = new THREE.WebGLRenderer();
                    renderer.setPixelRatio(window.devicePixelRatio);
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    container.appendChild(renderer.domElement);
                    scene = new THREE.Scene();
                    camera = new THREE.PerspectiveCamera(90, (window.innerWidth-340) / (window.innerHeight-90), 0.1, 100);
                    camera.position.z = 0.01;
                    controls = new THREE.OrbitControls(camera, renderer.domElement);
                    controls.enableZoom = false;
                    controls.enablePan = false;
                    controls.enableDamping = true;
                    controls.rotateSpeed = -0.25;
                    var textures = this.getTexturesFromAtlasFile(imgurl[0], 6);
                    console.log(textures);
                    var materials = [];
                    for (var i = 0; i < 6; i++) {
                        materials.push(new THREE.MeshBasicMaterial({map: textures[i]}));
                    }
                    var skyBox = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), materials);
                    skyBox.geometry.scale(1, 1, -1);
                    scene.add(skyBox);

                    window.addEventListener('resize', this.onWindowResize, false);
                }else if(imgurl.length===6){
                    var container, mesh;
                    container = document.getElementById( 'container' );
                    camera = new THREE.PerspectiveCamera( 75, (window.innerWidth-340) / (window.innerHeight-90), 1, 1100 );
                    scene = new THREE.Scene();
                    texture_placeholder = document.createElement( 'canvas' );
                    texture_placeholder.width = 128;
                    texture_placeholder.height = 128;
                    var context = texture_placeholder.getContext( '2d' );
                    context.fillStyle = 'rgb( 200, 200, 200 )';
                    context.fillRect( 0, 0, texture_placeholder.width, texture_placeholder.height );
                    var materials = [
                        this.loadTexture( imgurl[0] ), // right px. 正x
                        this.loadTexture( imgurl[1] ), // left nx,  负x
                        this.loadTexture( imgurl[2] ), // top  py,
                        this.loadTexture( imgurl[3] ), // bottom ny,
                        this.loadTexture( imgurl[4] ), // front  pz,
                        this.loadTexture( imgurl[5] )  // back nz
                    ];
                    var geometry = new THREE.BoxGeometry( 300, 300, 300, 7, 7, 7 );
                    geometry.scale( - 1, 1, 1 );
                    mesh = new THREE.Mesh( geometry, materials );
                    scene.add( mesh );
                    //添加一个球体
                    var geometry2=new THREE.SphereGeometry(500,30,20);
                    geometry2.scale(-1,1,1);
                    var material2=new THREE.MeshBasicMaterial({color:0xffffff});
                    var ball=new THREE.Mesh(geometry2,material2);
                    ball.material.transparent=true;
                    ball.material.opacity=0.0;
                    scene.add(ball);
                    renderer = new THREE.CanvasRenderer();
                    renderer.setPixelRatio( window.devicePixelRatio );
                    renderer.setSize( window.innerWidth-340, window.innerHeight-90 );
                    container.appendChild( renderer.domElement );
                    document.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
                    document.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
                    document.addEventListener( 'mouseup', this.onDocumentMouseUp, false );
                    document.addEventListener( 'wheel', this.onDocumentMouseWheel, false );
                    window.addEventListener( 'resize', this.onWindowResize, false );
                }


            },
            getTexturesFromAtlasFile:function(atlasImgUrl, tilesNum){
                var textures = [];
                for ( var i = 0; i < tilesNum; i ++ ) {
                    textures[ i ] = new THREE.Texture();
                }
                var imageObj = new Image();
                imageObj.onload = function() {
                    var canvas, context;
                    var tileWidth = imageObj.height;
                    for ( var i = 0; i < textures.length; i ++ ) {
                        canvas = document.createElement( 'canvas' );
                        context = canvas.getContext( '2d' );
                        canvas.height = tileWidth;
                        canvas.width = tileWidth;
                        context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
                        textures[ i ].image = canvas
                        textures[ i ].needsUpdate = true;
                    }
                };
                imageObj.src = atlasImgUrl;
                return textures;
            },
            onWindowResize() {
                camera.aspect = (window.innerWidth-340) / (window.innerHeight-90);
                camera.updateProjectionMatrix();
                renderer.setSize((window.innerWidth-340), (window.innerHeight-90));
            },
            animate() {
                if(this.imgUrl.length===1){
                    requestAnimationFrame(this.animate);
                    controls.update(); // required when damping is enabled
                    renderer.render( scene, camera );
                }else if(this.imgUrl.length===6){
                    this.update();
                    requestAnimationFrame( this.animate );

                }

            },
            loadTexture( path ) {
                var texture = new THREE.Texture( texture_placeholder );
                var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
                var image = new Image();
                image.onload = function () {
                    texture.image = this;
                    texture.needsUpdate = true;
                };
                image.src = path;
                return material;
            },
            onDocumentMouseDown( event ) {
                if(this.$store.state.test.imgType==='Cube Faces'){
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
                            var selected2=intersects[1];//取第二个物体球
                            tempXPositonArr.push(Number(selected2.point.x));
                            tempYPositonArr.push(Number(selected2.point.y));
                            tempZPositonArr.push(Number(selected2.point.z));
                            var selected = intersects[0];
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
                            let z=(tempZPositonArr[0] + tempZPositonArr[1] + tempZPositonArr[2]) / 3;
                            let y=(tempYPositonArr[0]+tempYPositonArr[1]+tempYPositonArr[2])/3;
                            let x=(tempXPositonArr[0] + tempXPositonArr[1] + tempXPositonArr[2]) / 3;
                            let canvas = document.createElement('canvas');
                            canvas.style.backgroundColor='rgba(255,255,255,0)';
                            let context = canvas.getContext('2d');
                            canvas.width = 128;
                            canvas.height = 128;
                            var img = new Image();
                            img.src = 'static/textures/hotspot.svg';
                            var that=this;
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
                                sprite.scale.set(18, 18, 18);
                                let rate = 0.8;
                                var endV=new THREE.Vector3(xAverage*rate,yAverage*rate,zAverage*rate);
                                sprite.position.copy(endV);
                                //利用球的pan和tilt来求，注意这里传参需要改变,将pan和tilt写到sprite的属性中
                                sprite.addition=that.calculatePanandTilt(-z,y,x);
                                //console.log(sprite.addition);
                                scene.add(sprite);

                            }
                            tempXPositonArr=[];
                            tempYPositonArr=[];
                            tempZPositonArr=[];
                            xPositionArr = [];
                            yPositionArr = [];
                            zPositionArr = [];
                        }
                        //移除热点
                    }else{
                        if(intersects.length>0){
                            const target = intersects[0];
                            //console.log(intersects[0])
                            try {
                                if(target.object&&target.object.type.length>0){
                                    if(target.object.type.toLowerCase()=="sprite"){
                                        scene.remove(target.object);
                                        //console.log(scene.children);
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
            onDocumentMouseMove( event ) {
                if ( isUserInteracting === true ) {
                    lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
                    lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
                }
            },
            onDocumentMouseUp( event ) {
                isUserInteracting = false;
            },
            onDocumentMouseWheel( event ) {
                var fov = camera.fov + event.deltaY * 0.05;
                camera.fov = THREE.Math.clamp( fov, 10, 75 );
                camera.updateProjectionMatrix();
            },
            update() {
                if ( isUserInteracting === false ) {
                    lon += 0;
                }
                lat = Math.max( - 85, Math.min( 85, lat ) );
                phi = THREE.Math.degToRad( 90 - lat );
                theta = THREE.Math.degToRad( lon );
                target.x = 500 * Math.sin( phi ) * Math.cos( theta );
                target.y = 500 * Math.cos( phi );
                target.z = 500 * Math.sin( phi ) * Math.sin( theta );
                camera.lookAt( target );
                renderer.render( scene, camera );
            },
            calculatePanandTilt(xAverage,yAverage,zAverage){
                let pan = 0;
                let tilt = 0;
                //计算出配置文件中热点的位置
                if ((-xAverage) > 0 && zAverage <= 0) {
                    pan = Math.atan(zAverage / (-xAverage)) * 180 / Math.PI;
                }
                if ((-xAverage) < 0 && zAverage < 0) {
                    pan = Math.atan(zAverage / (-xAverage)) * 180 / Math.PI - 180;
                }
                if ((-xAverage) > 0 && zAverage >= 0) {
                    pan = Math.atan(zAverage / (-xAverage)) * 180 / Math.PI;
                }
                if ((-xAverage) < 0 && zAverage > 0) {
                    pan = 180 + Math.atan(zAverage / (-xAverage)) * 180 / Math.PI;
                }
                tilt = Math.asin(yAverage / 500) * 180 / Math.PI;
                // console.log('pan: ' + pan);
                // console.log('tilt: ' + tilt);
                return [pan,tilt];
            }



        }
    }
</script>

<style scoped>

</style>