<template>
    <div id="container" class="panoramaContent">
      <!--<video controls="controls" height="300px" preload="metadata" id="video"-->
             <!--style="display: block; position: absolute; left: 15px; top: 75px;">-->
        <!--<source src="../../../static/movies/example.mp4" type="video/mp4">-->
      <!--</video>-->
    </div>
</template>

<script>
import $ from 'jquery'
let scene = "";
let camera = "";
let renderer = "";
let isUserInteracting = false;
let lon = 0;
let lat = 0;
let onPointerDownPointerX = "";
let onPointerDownLon = "";
let onPointerDownPointerY = "";
let onPointerDownLat = "";
let phi = 0;
let theta = 0;
let xPositionArr = [];
let yPositionArr = [];
let zPositionArr = [];
let startV;
let mesh;
let arr = [];
let uuid;//四变形面片的uuid
export default {
  name: "equirectangular",
  computed: {
    imgUrl() {
      let fileUrl = this.$store.state.test.imgFile.fileUrl;
      return fileUrl;
    },
    isSubmit() {
      let isSubmit = this.$store.state.test.isSubmit;
      return isSubmit;
    },
    //取得跳转热点信息
    drawedHotspots() {
      let sum = this.$store.state.test.sum;
      for (let i = 0; i < sum.length; i++) {
        let temp = sum[i].imgFile.fileUrl;
        console.log(temp);
        console.log(this.imgUrl);
        if (temp[0] == this.imgUrl[0]) {
          return sum[i].jumpHotSpots;
        }
      }
      return [];
    },
    //取得图片热点信息,需要改
    drawedImgHotSpots() {
      let sum = this.$store.state.test.sum;
      for (let i = 0; i < sum.length; i++) {
        let temp = sum[i].imgFile.fileUrl;
        if (temp[0] == this.imgUrl[0]) {
          return sum[i].urlHotSpots.concat(sum[i].imageHotSpots);
        }
      }
      return [];
    },
    //获得删除热点的状态信息
    newIsDeleteHotSpot() {
      let newIsDeleteHotSpot = this.$store.state.test.newIsDeleteHotSpot;
      return newIsDeleteHotSpot;
    },
    activeJumpHotSpot() {
      return this.$store.state.test.activeJumpHotSpot;
    },
    inactiveJumpHotSpot() {
      return this.$store.state.test.inactiveJumpHotSpot;
    },
    activeImageHotSpot() {
      return this.$store.state.test.activeImageHotSpot;
    },
    inactiveImageHotSpot() {
      return this.$store.state.test.inactiveImageHotSpot;
    },
    activeUrlHotSpot() {
      return this.$store.state.test.activeUrlHotSpot;
    },
    inactiveUrlHotSpot() {
      return this.$store.state.test.inactiveUrlHotSpot;
    },
    sceneDelete(){
      return this.$store.state.test.sceneDelete;
    },

    //视频热点的参数
    transformX() {
        return this.$store.state.test.isVideoTransformX;
    },
    transformY() {
      return this.$store.state.test.isVideoTransformY;
    },
    rotate() {
      return this.$store.state.test.isVideoRotate;
    },
    scale() {
      return this.$store.state.test.isVideoScale;
    },
  },
  watch: {
    imgUrl(newvalue) {
      document.getElementById("container").innerHTML = "";
      //改变了场景后将state.target和state.hotSpots清空
      this.$store.commit("clearHotSpots");
      this.init(newvalue);
      this.animate();
    },
    //找出所有的热点，注意这里的热点位置信息需要转换(转换关系1.25倍)
    isSubmit() {
      let children = scene.children;
      let imgHotSpots = [];
      let sprites = [];
      let hotUrl = this.$store.state.test.hotUrl;
      let m = 0;
      for (let i = 0, len = children.length; i < len; i++) {
        if (children[i].type.toLowerCase() === "sprite") {
          let panAndTilt = this.calculatePanandTilt(
            children[i].position.x * 1.25,
            children[i].position.y * 1.25,
            children[i].position.z * 1.25
          );
          sprites.push({
            panAndTilt: panAndTilt,
            position: [
              children[i].position.x * 1.25,
              children[i].position.y * 1.25,
              children[i].position.z * 1.25
            ]
          });
        }
        if (children[i].material.type.toLowerCase() === "meshnormalmaterial") {
          //计算四个点的panandTilt
          let polyhotspot = [];
          for (
            //vertices代表构成了几何体的顶点
            let j = 0, len = children[i].geometry.vertices.length;
            j < len;
            j++
          ) {
            polyhotspot.push(
              this.calculatePanandTilt(
                children[i].geometry.vertices[j].x,
                children[i].geometry.vertices[j].y,
                children[i].geometry.vertices[j].z
              )
            );
          }
          //这里的target是用户上传的图片热点图片路径，暂时先写死images/temp.png
          //imgHotSpots.push({'panAndTilt':polyhotspot,'position':children[i].geometry.vertices,'target':null,'hotUrl':hotUrl[m++]});
          imgHotSpots.push({
            panAndTilt: polyhotspot,
            position: children[i].geometry.vertices//vertices代表构成了几何体的顶点
          });
        }
      }
      //提交到state中
      this.$store.dispatch("hotSpots", {sprites: sprites});
      this.$store.dispatch("imgHotSpots", {imgHotSpots: imgHotSpots});
    },

    //监听删除热点信息的改变并执行函数
    newIsDeleteHotSpot() {
      //热点管理删除图像热点
      if (this.$store.state.test.newIsDeleteHotSpot) {
        //如果是跳转热点则将其删除
        if (this.$store.state.test.pid === 4) {
          this.deleteJumpHotSpot(this.$store.state.test);
        }
        //如果是图像热点则将其删除
        if (this.$store.state.test.pid === 6 || this.$store.state.test.pid === 7) {
          this.deleteImageHotSpot(this.$store.state.test);
        }
      }
    },
    //点击热点管理的跳转热点区域框则变为新的热点
    activeJumpHotSpot() {
      //当前场景下遍历该类型热点，判断是否拥有active属性
      for (let i = 0; i < this.$store.state.test.jumpHotSpots.length; i++) {
        if (this.$store.state.test.jumpHotSpots[i].hasOwnProperty("active")) {
          //删除旧的热点(红)
          this.deleteJumpHotSpot(this.$store.state.test.jumpHotSpots[i]);
          //绘制新热点(蓝)
          this.drawJumpHotSpot(this.$store.state.test.jumpHotSpots[i].position,"static/textures/hotspot.svg");
          delete this.$store.state.test.jumpHotSpots[i].active;
        }
      }
      for (let i = 0; i < this.$store.state.test.jumpHotSpots.length; i++) {
      if (Math.round(this.$store.state.test.jumpHotSpots[i].position[0]) ===
        Math.round(this.$store.state.test.activePost.children[0].position[0]) &&
        Math.round(this.$store.state.test.jumpHotSpots[i].position[1]) ===
        Math.round(this.$store.state.test.activePost.children[0].position[1]) &&
        Math.round(this.$store.state.test.jumpHotSpots[i].position[2]) ===
        Math.round(this.$store.state.test.activePost.children[0].position[2])) {
        this.$store.state.test.jumpHotSpots[i].active = true;
        //删除旧的热点(蓝)
        this.deleteJumpHotSpot(this.$store.state.test.jumpHotSpots[i]);
        //绘制新热点(红)
        this.drawJumpHotSpot(this.$store.state.test.activePost.children[0].position,"static/textures/Clickhotspot.svg");
      }
    }
    },
    //修改热点管理的跳转信息则变会原来的热点
    inactiveJumpHotSpot(){
      //当前场景下遍历该类型热点，判断是否拥有active属性
      for (let i = 0; i < this.$store.state.test.jumpHotSpots.length; i++) {
        if (this.$store.state.test.jumpHotSpots[i].hasOwnProperty("active")) {
          //删除旧的热点(红)
          //console.log(scene);
          this.deleteJumpHotSpot(this.$store.state.test.jumpHotSpots[i]);
          //绘制新热点(蓝)
          this.drawJumpHotSpot(this.$store.state.test.jumpHotSpots[i].position,"static/textures/hotspot.svg");
          //删除添加的active属性
          delete this.$store.state.test.jumpHotSpots[i].active;
        }
      }
    },
    //点击热点管理的图像热点区域框则变为新的热点
    activeImageHotSpot() {
      //当前场景下遍历该类型热点，判断是否拥有active属性
      for (let i = 0; i < this.$store.state.test.imageHotSpots.length; i++) {
        if (this.$store.state.test.imageHotSpots[i].hasOwnProperty("active")) {
          //删除旧的图像热点(Lambert)
          this.deleteImageHotSpot(this.$store.state.test.imageHotSpots[i]);
          //绘制点击后的新热点(normal)
          this.drawImageHotSpot(this.$store.state.test.imageHotSpots[i].position);
          delete this.$store.state.test.imageHotSpots[i].active;
        }
      }
      for (let i = 0; i < this.$store.state.test.imageHotSpots.length; i++) {
        if (Math.round(this.$store.state.test.imageHotSpots[i].position[0].x) ===
          Math.round(this.$store.state.test.activePost.children[0].position[0].x) &&
          Math.round(this.$store.state.test.imageHotSpots[i].position[1].x) ===
          Math.round(this.$store.state.test.activePost.children[0].position[1].x) &&
          Math.round(this.$store.state.test.imageHotSpots[i].position[2].x) ===
          Math.round(this.$store.state.test.activePost.children[0].position[2].x) &&
          Math.round(this.$store.state.test.imageHotSpots[i].position[3].x) ===
          Math.round(this.$store.state.test.activePost.children[0].position[3].x)) {
          this.$store.state.test.imageHotSpots[i].active = true;
          //删除旧的热点(normal)
          this.deleteImageHotSpot(this.$store.state.test.imageHotSpots[i]);
          //绘制点击后的新热点(Lambert)
          this.drawNewImageHotSpot(this.$store.state.test.imageHotSpots[i].position);
          }
        }
    },
    //修改热点管理的图像热点信息则变为新的热点
    inactiveImageHotSpot(){
      //当前场景下遍历该类型热点，判断是否拥有active属性
      for (let i = 0; i < this.$store.state.test.imageHotSpots.length; i++) {
        if (this.$store.state.test.imageHotSpots[i].hasOwnProperty("active")) {
          //删除旧的热点(Lambert)
          this.deleteImageHotSpot(this.$store.state.test.imageHotSpots[i]);
          //绘制点击后的新热点(normal)
          this.drawImageHotSpot(this.$store.state.test.imageHotSpots[i].position);
          delete this.$store.state.test.imageHotSpots[i].active;
        }
      }
    },
    //点击热点管理的Url热点区域框则变为新的热点
    activeUrlHotSpot(){
      //当前场景下遍历该类型热点，判断是否拥有active属性
      for (let i = 0; i < this.$store.state.test.urlHotSpots.length; i++) {
        if (this.$store.state.test.urlHotSpots[i].hasOwnProperty("active")) {
          //删除旧的图像热点(Lambert)
          this.deleteImageHotSpot(this.$store.state.test.urlHotSpots[i]);
          //绘制点击后的新热点(normal)
          this.drawImageHotSpot(this.$store.state.test.urlHotSpots[i].position);
          delete this.$store.state.test.urlHotSpots[i].active;
        }
      }
      for (let i = 0; i < this.$store.state.test.urlHotSpots.length; i++) {
        if (Math.round(this.$store.state.test.urlHotSpots[i].position[0].x) ===
          Math.round(this.$store.state.test.activePost.children[0].position[0].x) &&
          Math.round(this.$store.state.test.urlHotSpots[i].position[1].x) ===
          Math.round(this.$store.state.test.activePost.children[0].position[1].x) &&
          Math.round(this.$store.state.test.urlHotSpots[i].position[2].x) ===
          Math.round(this.$store.state.test.activePost.children[0].position[2].x)){
          this.$store.state.test.urlHotSpots[i].active = true;
          //删除旧的热点(normal)
          this.deleteImageHotSpot(this.$store.state.test.urlHotSpots[i]);
          //绘制点击后的新热点(Lambert)
          this.drawNewImageHotSpot(this.$store.state.test.urlHotSpots[i].position);
        }
      }
    },
    //修改热点管理的Url热点信息则变为新的热点
    inactiveUrlHotSpot() {
      //当前场景下遍历该类型热点，判断是否拥有active属性
      for (let i = 0; i < this.$store.state.test.urlHotSpots.length; i++) {
        if (this.$store.state.test.urlHotSpots[i].hasOwnProperty("active")) {
          //删除旧的图像热点(Lambert)
          this.deleteImageHotSpot(this.$store.state.test.urlHotSpots[i]);
          //绘制点击后的新热点(normal)
          this.drawImageHotSpot(this.$store.state.test.urlHotSpots[i].position);
          delete this.$store.state.test.urlHotSpots[i].active;
        }
      }
    },
    //删除场景需要把arr的内容也删除
    sceneDelete(){
      this.$store.commit("saveimgFile",{fileUrl:[],fileName:''});
    },

    //监听视频热点的平移旋转和放缩
    transformX(){
      //把之前的四边形热点删除
      for (let i = 0; i < scene.children.length ; i++) {
        if(scene.children[i].uuid===uuid){
          scene.children.splice(i, 1);
        }
      }
      //绘制平移之后新的热点
      //this.drawVideoHotSpot(this.$store.state.test.oldselected);

      //demo
      this.newDrawVideoHotSpotX(this.$store.state.test.oldselected,this.$store.state.test.valueX);
    },
    transformY(){
      //把之前的四边形热点删除
      for (let i = 0; i < scene.children.length ; i++) {
        if(scene.children[i].uuid===uuid){
          scene.children.splice(i, 1);
        }
      }
      //绘制平移之后新的热点
      this.newDrawVideoHotSpotY(this.$store.state.test.oldselected,this.$store.state.test.valueY);
    },
    rotate(){
      //把之前的四边形热点删除
      for (let i = 0; i < scene.children.length ; i++) {
        if(scene.children[i].uuid===uuid){
          scene.children.splice(i, 1);
        }
      }

      //绘制旋转之后新的热点
      //this.drawRotateVideoHotSpot(this.$store.state.test.oldselected,this.$store.state.test.videoRotate);
      this.newDrawVideoHotSpotR(this.$store.state.test.oldselected,this.$store.state.test.valueR);
    },
    scale(){
      //把之前的四边形热点删除
      for (let i = 0; i < scene.children.length ; i++) {
        if(scene.children[i].uuid===uuid){
          scene.children.splice(i, 1);
        }
      }
      //绘制旋转之后新的热点
      this.drawScaleVideoHotSpot(this.$store.state.test.oldselected,this.$store.state.test.videoScale);
    }
  },
  mounted() {
    //获取xml的方法
    this.readXMl();
    this.init(this.imgUrl);
    this.animate();
  },

  methods: {
    readXMl: function (){
      //把xml文件传进来
      //var arr = [];
      $.ajax({
        url: "static/Test.xml",
        dataType: 'xml',
        type: 'GET',
        timeout: 2000,
        async:false,
        error: function(err)
        {
          alert("加载XML文件出错！");
          // console.log(err);
        },
        success: function(xml)
        {
          var panorama = $(xml).find("panorama");
          var len = $(xml).find("panorama").length;
          for (let i = 0; i <len; i++) {
            let obj={
              panorama:[],
              input:[],
              polystyle:[],
              hotspot:[],
              polyhotspot:{
                urlHotSpots:[],
                imageHotSpots:[]
              },
              fileArr:[],

            };
            let obj3={
              fileName:[],
              fileUrl:[]
            };
            obj.panorama=panorama.eq(i).attr("id");
            obj3.fileName=panorama.eq(i).find("input").attr("fileName");
            obj3.fileUrl=panorama.eq(i).find("input").attr("fileUrl");
            obj.fileArr.push(obj3);
            obj.input=panorama.eq(i).find("input").attr("leveltileurl");
            obj.polystyle=panorama.eq(i).find("polystyle").attr("mode");
            let len1 = panorama.eq(i).find("hotspot").length;//跳转热点的个数
            let hotspot = panorama.eq(i).find("hotspot");
            let polyhotspot = panorama.eq(i).find("polyhotspot");
            let len2 = polyhotspot.length;//图像热点的个数

            for (let j = 0; j <len1 ; j++) {
              let obj1={
                tilt:[],
                url:[],
                id:[],
                position:[],
                panAndTilt:[]
              };

              obj1.panAndTilt[0]=hotspot.eq(j).attr("pan");
              obj1.panAndTilt[1]=hotspot.eq(j).attr("tilt");
              obj1.url=hotspot.eq(j).attr("url");
              obj1.title=hotspot.eq(j).attr("title");
              obj1.id=hotspot.eq(j).attr("id");
              obj1.position[0]=hotspot.eq(j).attr("jumpHotSpotsx");
              obj1.position[1]=hotspot.eq(j).attr("jumpHotSpotsy");
              obj1.position[2]=hotspot.eq(j).attr("jumpHotSpotsz");

              obj.hotspot.push(obj1);
            }
            for (let j = 0; j <len2 ; j++) {

              if(polyhotspot.eq(j).attr("id")==="hpimage"){
                let obj1={
                  position:[],
                  target:[],
                  panAndTilt:[],
                };

                obj1.target=polyhotspot.eq(j).attr("target");
                let vertex=polyhotspot.eq(j).find("vertex");
                for (let k = 0; k <vertex.length; k++) {
                  obj1.panAndTilt[k]=new Array(2);
                  obj1.position[k]={
                    x:[],
                    y:[],
                    z:[]
                  };
                  obj1.panAndTilt[k][0]=vertex.eq(k).attr("pan");
                  obj1.panAndTilt[k][1]=vertex.eq(k).attr("tilt");
                  obj1.position[k].x=vertex.eq(k).attr("imageHotSpotsx");
                  obj1.position[k].y=vertex.eq(k).attr("imageHotSpotsy");
                  obj1.position[k].z=vertex.eq(k).attr("imageHotSpotsz");
                }

                obj.polyhotspot.imageHotSpots.push(obj1);
              }else{
                let obj1={
                  position:[],
                  id:[],
                  url:[],
                  panAndTilt:[]
                };

                obj1.id=polyhotspot.eq(j).attr("id");
                obj1.url=polyhotspot.eq(j).attr("url");
                let vertex=polyhotspot.eq(j).find("vertex");
                for (let k = 0; k <vertex.length; k++) {
                  obj1.panAndTilt[k]=new Array(2);
                  obj1.position[k]={
                    x:[],
                    y:[],
                    z:[]
                  };
                  obj1.panAndTilt[k][0]=vertex.eq(k).attr("pan");
                  obj1.panAndTilt[k][1]=vertex.eq(k).attr("tilt");
                  obj1.position[k].x=vertex.eq(k).attr("urlHotSpotsx");
                  obj1.position[k].y=vertex.eq(k).attr("urlHotSpotsy");
                  obj1.position[k].z=vertex.eq(k).attr("urlHotSpotsz");
                }

                obj.polyhotspot.urlHotSpots.push(obj1);
              }
            }
            arr.push(obj);
          }
        }
      });
      //把热点信息提交给status,必须保证在status中没有该场景信息才添加
      let state = this.$store.state.test;
      for (let i = 0; i < arr.length; i++) {
        state.fileUrlArr.push(arr[i].fileArr[0]);
      }
    },
    init: function (imgurl) {
      if (imgurl.length > 1) {
        alert(
          "抱歉，一张图请选择panorama1，六张图请选择panorama6且只支持cubeFaces"
        );
        return;
      }
      let container = "";
      container = document.getElementById("container");
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        (window.innerWidth - 340) / (window.innerHeight - 90),
        1,
        1100
      );
      camera.target = new THREE.Vector3(0, 0, 0);
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      // const material = new THREE.MeshBasicMaterial({
      //     map: new THREE.TextureLoader().load('http://172.28.211.16:8010/M00/01/03/rBzTEFsg8myAFSMyAEFP4gt3Z0E13.jpeg')
      // });
      // mesh = new THREE.Mesh(geometry, material);
      // scene.add(mesh);

      //防止跨域用canvas作为纹理
      let canvas = document.createElement("canvas");
      canvas.style.backgroundColor = "rgba(255,255,255,0)";
      let context = canvas.getContext("2d");
      let img = new Image();
      img.src = imgurl[0];

      // img.src='http://172.28.211.16:8010/M00/02/03/rBzTEFu9U7KAGMh7AB9vhFs03DM33.jpeg';
      // img.crossOrigin = "Anonymous";

      // img.src='http://172.28.211.16:8010/M00/01/03/rBzTEFsg8myAFSMyAEFP4gt3Z0E13.jpeg';
      // img.src='';      //绘制全景图
      img.onload = function () {
        canvas.width = this.width;
        canvas.height = this.height;
        context.drawImage(img, 0, 0, this.width, this.height);
        let texture = new THREE.Texture();
        texture.image = canvas;
        texture.needsUpdate = true;//开启纹理更新
        texture.minFilter = THREE.LinearFilter;//minFilter属性：指定纹理如何缩小
        let material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: false
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      };

      //画已经保存的热点
      this.drawJumpHotSpots(this.drawedHotspots,"static/textures/hotspot.svg");
      //画已经保存的图片热点
      this.drawImageHotSpots(this.drawedImgHotSpots);

      //判断xml字符串中的场景与目前所在场景相同的是哪一个
      let count = -1;
      let state = this.$store.state.test;
      for (let i = 0; i <arr.length; i++) {
        if(arr[i].fileArr[0].fileUrl===state.imgFile.fileUrl[0]){
          count = i;
        }
      }

      if(count !== -1){
        //把相同场景中的热点信息commit给state
        let  len = arr[count].hotspot.length;

        for (let j = 0; j <len ; j++) {
          let obj={};
          obj.hotTarget=arr[count].hotspot[j].url.replace("{","").replace("}","").replace('node', "场景");
          obj.hotIntroduction=arr[count].hotspot[j].title.replace("{","").replace("}","");
          obj.position=arr[count].hotspot[j].position;
          obj.panAndTilt=arr[count].hotspot[j].panAndTilt;
          state.jumpHotSpots.push(obj);
        }
        let len2 = arr[count].polyhotspot.imageHotSpots.length;
        let len3 = arr[count].polyhotspot.urlHotSpots.length;
        for (let j = 0; j < len3; j++) {
          let obj={};
          let reg2 = /([^/]+)$/;
          obj.hotUrl=arr[count].polyhotspot.urlHotSpots[j].url.match(reg2)[1];
          obj.position=arr[count].polyhotspot.urlHotSpots[j].position;
          obj.panAndTilt=arr[count].polyhotspot.urlHotSpots[j].panAndTilt;
          state.urlHotSpots.push(obj);
        }
        for (let j = 0; j < len2; j++) {
          let obj={};
          let reg2 = /([^/]+)$/;
          obj.hotImage=arr[count].polyhotspot.imageHotSpots[j].target.match(reg2)[1];
          obj.position=arr[count].polyhotspot.imageHotSpots[j].position;
          obj.panAndTilt=arr[count].polyhotspot.imageHotSpots[j].panAndTilt;
          state.imageHotSpots.push(obj);
        }

        //当xml字符串中有场景则把场景中的热点信息进行绘制，必须判断xml字符串中的场景与目前所在场景相同才绘制热点
        //绘制xml字符串中的跳转热点
        this.drawJumpHotSpots(arr[count].hotspot,"static/textures/hotspot.svg");
        //绘制xml字符串中的图像热点
        this.drawImageHotSpots(arr[count].polyhotspot.imageHotSpots);
        this.drawImageHotSpots(arr[count].polyhotspot.urlHotSpots);
      }

      this.$store.commit('addArr', arr);

      renderer = new THREE.WebGLRenderer();
      // renderer=new THREE.CanvasRenderer();

      renderer.setPixelRatio(window.devicePixelRatio);
      //确保区域大小
      renderer.setSize(window.innerWidth - 340, window.innerHeight - 90);
      container.appendChild(renderer.domElement);
      // 当鼠标指针移动到元素上方，并按下鼠标按键（左、右键均可）
      document
        .getElementsByTagName("canvas")[0]
        .addEventListener("mousedown", this.onDocumentMouseDown, false);
      document
        .getElementsByTagName("canvas")[0]
        .addEventListener("mousemove", this.onDocumentMouseMove, false);
      document
        .getElementsByTagName("canvas")[0]
        .addEventListener("mouseup", this.onDocumentMouseUp, false);
      document
        .getElementsByTagName("canvas")[0]
        .addEventListener("wheel", this.onDocumentMouseWheel, false);//wheel鼠标滚轮

      document.getElementsByTagName("canvas")[0].addEventListener(
        "dragover",
        event => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        },
        false
      );
      document.getElementsByTagName("canvas")[0].addEventListener(
        "dragenter",
        () => {
          document.body.style.opacity = 0.5;
        },
        false
      );
      document.getElementsByTagName("canvas")[0].addEventListener(
        "dragleave",
        () => {
          document.body.style.opacity = 1;
        },
        false
      );
      window.addEventListener("resize", this.onWindowResize, false);
    },
    //由于前面-340，-90这里的效果没有测试，随着页面框变化而变化
    onWindowResize() {
      camera.aspect = (window.innerWidth - 340) / (window.innerHeight - 90);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth - 340, window.innerHeight - 90);
    },
    onDocumentMouseDown: function (event) {
      //首先确保imgType是auto，否则添加点击事件
      if (
        this.$store.state.test.imgType === "Auto" ||
        this.$store.state.test.imgType === "Equirectangular"
      ) {
        event.preventDefault();
        let vector = new THREE.Vector3(); //三维坐标对象
        vector.set(
          //注意：这里是根据render的size来确定的
          ((event.clientX - 320) / (window.innerWidth - 340)) * 2 - 1,
          -((event.clientY - 70) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);
        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        let intersects = raycaster.intersectObjects(scene.children);
        //如果绘制热点属于激活状态
        if (this.$store.state.test.isHotspot) {
          if (intersects.length > 0) {
            var selected = intersects[0]; //取第一个物体
            startV = selected.point;
            xPositionArr.push(selected.point.x);
            yPositionArr.push(selected.point.y);
            zPositionArr.push(selected.point.z);
          }
          if (xPositionArr.length == 3) {
            document.getElementById("container").style.cursor = "default";
            this.$store.dispatch("isHotspot");
            let xAverage =
              (xPositionArr[0] + xPositionArr[1] + xPositionArr[2]) / 3;
            let yAverage =
              (yPositionArr[0] + yPositionArr[1] + yPositionArr[2]) / 3;
            let zAverage =
              (zPositionArr[0] + zPositionArr[1] + zPositionArr[2]) / 3;
            let canvas = document.createElement("canvas");
            canvas.style.backgroundColor = "rgba(255,255,255,0)";
            let context = canvas.getContext("2d");
            canvas.width = 128;
            canvas.height = 128;
            let img = new Image();
            //这里发布的时候会出现http://localhost:8083/web/dist/static/textures/hotspot.svg
            img.src = "static/textures/hotspot.svg";
            //发布用
            //img.src = 'textures/hotspot.svg';
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
              var endV = new THREE.Vector3(
                xAverage * rate,
                yAverage * rate,
                zAverage * rate
              );
              sprite.position.copy(endV);
              scene.add(sprite);
              //that.$store.commit('showJumpHotSpot');
            };

            xPositionArr = [];
            yPositionArr = [];
            zPositionArr = [];
          }
          //移除热点
        }else {
          if (intersects.length > 0) {
            const target = intersects[0];
            //console.log(intersects[0])
            try {
              if (target.object && target.object.type.length > 0) {
                if (target.object.type.toLowerCase() == "sprite") {
                  if (this.$store.state.test.isDeleteHotSpot) {
                    scene.remove(target.object);
                    this.$store.commit("deletedHotSpot");
                    this.$store.commit("hideHotSpot");
                  } else {
                    let location = target.object.position;
                    let panAndTilt = this.calculatePanandTilt(
                      location.x * 1.25,
                      location.y * 1.25,
                      location.z * 1.25
                    );
                    this.$store.commit("showJumpHotSpot");
                    this.$store.commit("saveTempLocation", {
                      location: [
                        location.x * 1.25,
                        location.y * 1.25,
                        location.z * 1.25
                      ],
                      panAndTilt: panAndTilt,
                      ID:"JumpHotSpot",
                    });

                  }
                }
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
        //如果绘制imageHotspot热点
        if (this.$store.state.test.isImageHotspot) {
          if (intersects.length > 0) {
            var selected = intersects[0]; //取第一个物体
            startV = selected.point;
            xPositionArr.push(selected.point.x);
            //console.log("x坐标:" + xPositionArr);
            yPositionArr.push(selected.point.y);
            //console.log("y坐标:" + yPositionArr);
            zPositionArr.push(selected.point.z);
            //console.log("z坐标:" + zPositionArr);
          }
          //画点
          if (xPositionArr.length == 1) {
            let geom = new THREE.Geometry();
            let material = new THREE.PointsMaterial({
              color: 0x0000ff,
              size: 10
            });
            geom.vertices.push(
              new THREE.Vector3(
                xPositionArr[0],
                yPositionArr[0],
                zPositionArr[0]
              )
            );
            let point = new THREE.Points(geom, material);
            scene.add(point);
          }
          //画线
          if (xPositionArr.length == 2) {
            //粒子
            let geom = new THREE.Geometry();
            let material = new THREE.ParticleBasicMaterial({
              color: 0x0000ff,
              size: 10
            });
            //geom.vertices.push(new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]));
            geom.vertices.push(
              new THREE.Vector3(
                xPositionArr[1],
                yPositionArr[1],
                zPositionArr[1]
              )
            );
            let point = new THREE.Points(geom, material);
            scene.add(point);
            //线
            let line = new THREE.Geometry();
            line.vertices.push(
              new THREE.Vector3(
                xPositionArr[0],
                yPositionArr[0],
                zPositionArr[0]
              )
            );
            line.vertices.push(
              new THREE.Vector3(
                xPositionArr[1],
                yPositionArr[1],
                zPositionArr[1]
              )
            );
            let mesh = new THREE.Line(line, material, THREE.LineSegments);
            scene.add(mesh);
          }
          //画三角形
          if (xPositionArr.length == 3) {
            //粒子
            let geom = new THREE.Geometry();
            let material = new THREE.ParticleBasicMaterial({
              color: 0x0000ff,
              size: 10
            });
            //geom.vertices.push(new THREE.Vector3(xPositionArr[0],yPositionArr[0],zPositionArr[0]));
            geom.vertices.push(
              new THREE.Vector3(
                xPositionArr[2],
                yPositionArr[2],
                zPositionArr[2]
              )
            );
            let point = new THREE.Points(geom, material);
            scene.add(point);
            //线
            let line1 = new THREE.Geometry();
            line1.vertices.push(
              new THREE.Vector3(
                xPositionArr[1],
                yPositionArr[1],
                zPositionArr[1]
              )
            );
            line1.vertices.push(
              new THREE.Vector3(
                xPositionArr[2],
                yPositionArr[2],
                zPositionArr[2]
              )
            );
            let mesh1 = new THREE.Line(line1, material, THREE.LineSegments);
            scene.add(mesh1);
            let line2 = new THREE.Geometry();
            line2.vertices.push(
              new THREE.Vector3(
                xPositionArr[2],
                yPositionArr[2],
                zPositionArr[2]
              )
            );
            line2.vertices.push(
              new THREE.Vector3(
                xPositionArr[0],
                yPositionArr[0],
                zPositionArr[0]
              )
            );
            let mesh2 = new THREE.Line(line2, material, THREE.LineSegments);
            scene.add(mesh2);
          }
          if (xPositionArr.length === 4) {
            document.getElementById("container").style.cursor = "default";
            this.$store.dispatch("isImageHotspot");
            //将之前的点和线删除
            let children = scene.children;
            for (let i = 0; i < children.length; i++) {
              if (
                children[i].type.toLowerCase() === "points" ||
                children[i].type.toLowerCase() === "line"
              ) {
                scene.remove(children[i]);
                i--;
              }
            }

            var v1 = new THREE.Vector3(
              xPositionArr[0],
              yPositionArr[0],
              zPositionArr[0]
            );
            var v2 = new THREE.Vector3(
              xPositionArr[1],
              yPositionArr[1],
              zPositionArr[1]
            );
            var v3 = new THREE.Vector3(
              xPositionArr[2],
              yPositionArr[2],
              zPositionArr[2]
            );
            var v4 = new THREE.Vector3(
              xPositionArr[3],
              yPositionArr[3],
              zPositionArr[3]
            );
            //画三角面片
            var geom = new THREE.Geometry();
            geom.vertices.push(v1);
            geom.vertices.push(v2);
            geom.vertices.push(v3);
            geom.vertices.push(v4);

            let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
            let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
            let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
            let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
            let d01 =
              (p1[0] - p0[0]) * (p1[0] - p0[0]) +
              (p1[1] - p0[1]) * (p1[1] - p0[1]) +
              (p1[2] - p0[2]) * (p1[2] - p0[2]);
            let d02 =
              (p2[0] - p0[0]) * (p2[0] - p0[0]) +
              (p2[1] - p0[1]) * (p2[1] - p0[1]) +
              (p2[2] - p0[2]) * (p2[2] - p0[2]);
            let d03 =
              (p3[0] - p0[0]) * (p3[0] - p0[0]) +
              (p3[1] - p0[1]) * (p3[1] - p0[1]) +
              (p3[2] - p0[2]) * (p3[2] - p0[2]);
            let max = Math.max(d01, d02, d03);
            let normal = geom.computeFaceNormals();


            let panAndTilt = this.calculatePanandTilt((p0[0]+p1[0]+p2[0]+p3[0])/4,(p0[1]+p1[1]+p2[1]+p3[1])/4,(p0[2]+p1[2]+p2[2]+p3[2])/4);
            console.log(panAndTilt);

            function angleCalculation(a,b,c) {
              //把a三维向量复制给vn
              let vn = a.clone();
              //求得vn和b的叉乘
              vn.cross( b );
              //将vn单位化
              vn.normalize();
              //把vn和c两个向量相乘
              let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
              //用向量乘积除以对应向量的模得到夹角
              return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
            }

            if (max === d01) {

              let angle=angleCalculation(v1,v2,v3);
              if(angle>0){
                //2在下方
                geom.faces.push(new THREE.Face3(0, 2, 1, normal));
                geom.faces.push(new THREE.Face3(1, 3, 0, normal));
              }else{
                //2在上方
                geom.faces.push(new THREE.Face3(1, 2, 0, normal));
                geom.faces.push(new THREE.Face3(0, 3, 1, normal));
              }
            }
            if (max === d02) {

              let angle=angleCalculation(v1,v3,v2);
              if(angle>0){
                //1在下方
                geom.faces.push(new THREE.Face3(0, 1, 2, normal));
                geom.faces.push(new THREE.Face3(2, 3, 0, normal));
              }else{
                //1在上方
                geom.faces.push(new THREE.Face3(0, 3, 2, normal));
                geom.faces.push(new THREE.Face3(2, 1, 0, normal));
              }
            }
            if (max === d03) {

              let angle=angleCalculation(v1,v4,v2);
              if(angle>0){
                //1在下方
                geom.faces.push(new THREE.Face3(0, 1, 3, normal));
                geom.faces.push(new THREE.Face3(3, 2, 0, normal));
              }else{
                //1在上方
                geom.faces.push(new THREE.Face3(0, 2, 3, normal));
                geom.faces.push(new THREE.Face3(3, 1, 0, normal));
              }
            }

            let material = new THREE.MeshNormalMaterial({flatShading: true});
            //let material = new THREE.MeshBasicMaterial({color:0x0000ff});
            material.transparent = true;
            material.opacity = 0.8;
            let object = new THREE.Mesh(geom, material);


            scene.add(object);

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
                if (target.object.material.type.toLowerCase() === "meshnormalmaterial") {
                  if (this.$store.state.test.isDeleteHotSpot) {
                    console.log(target.object);
                    scene.remove(target.object);
                    this.$store.commit("deletedHotSpot");
                    this.$store.commit("hideHotSpot");
                  } else {
                    let location = target.object.geometry.vertices;
                    let arr = [];
                    for (let j = 0, len = location.length; j < len; j++) {
                      arr.push(
                        this.calculatePanandTilt(
                          location[j].x,
                          location[j].y,
                          location[j].z
                        )
                      );
                    }
                    this.$store.commit("showImgHotSpot");
                    this.$store.commit("saveTempLocation", {
                      location: location,
                      panAndTilt: arr,
                      ID:"ImgHotSpot"
                    });
                  }
                }
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
        //如果绘制视频热点
        if (this.$store.state.test.isVideoHotspot) {

          //   if (intersects.length > 0) {
        //   let selected = intersects[0];
        //   console.log(selected);
        //   console.log(selected.point);
        //
        //   let vec2 = selected.point.project(camera);
        //   console.log(vec2);
        //   var screenCoord = {};
        //   screenCoord.x = (0.5 + vec2.x / 2) * (window.innerWidth - 340);
        //   screenCoord.y = (0.5 - vec2.y / 2) * (window.innerHeight - 90);
        //   console.log(screenCoord);
        //   var standardVector  = new THREE.Vector3(screenCoord.x, screenCoord.y, 0.5);
        //   console.log(standardVector.unproject(camera));
        //
        //
        //   console.log(event.clientX + "," + event.clientY);
        //   let halfWidth = (window.innerWidth - 340)/ 2;
        //   let halfHeight = (window.innerHeight - 90)/ 2;
        //   let left=vec2.x * halfWidth + halfWidth;
        //   let top=-vec2.y * halfHeight + halfHeight;
        //   console.log(left + "," + top);
        // }

          if (intersects.length > 0) {
            let selected = intersects[0]; //取第一个物体
            this.$store.dispatch("isVideoHotspot");
            //保存点击的中心点的屏幕二维坐标
            let oldselected = {
              client:[event.clientX,event.clientY],
              select:[selected.point.x,selected.point.y,selected.point.z],
              vector:{},
            };

            //把世界坐标保存
            let vector = new THREE.Vector3();
            vector.set(
              ((oldselected.client[0] - 320) / (window.innerWidth - 340)) * 2 - 1,
              -((oldselected.client[1] - 70) / (window.innerHeight - 90)) * 2 + 1,
              0.5
            );
            vector.unproject(camera);
            //console.log(camera.position);//打印出来是{0，0，0}

            oldselected.vector = vector.clone();
            // console.log(oldselected.client);
            console.log(oldselected);
            console.log(oldselected.vector);

            this.drawVideoHotSpot(oldselected);

            intersects = {};
            this.$store.commit("saveOldSelected",oldselected);
          }

        } else {
          if (intersects.length > 0) {
            const target = intersects[0];
            try {
              if (target.object && target.object.type.length > 0) {
                if (target.object.material.type.toLowerCase() === "meshlambertmaterial") {
                  if (this.$store.state.test.isDeleteHotSpot) {
                    console.log(target.object);
                    scene.remove(target.object);
                    this.$store.commit("deletedHotSpot");
                    this.$store.commit("hideHotSpot");
                  } else {
                    let location = target.object.geometry.vertices;
                    let arr = [];
                    for (let j = 0, len = location.length; j < len; j++) {
                      arr.push(
                        this.calculatePanandTilt(
                          location[j].x,
                          location[j].y,
                          location[j].z
                        )
                      );
                    }
                    this.$store.commit("showVideoHotSpot");
                    this.$store.commit("saveTempLocation", {
                      location: location,
                      panAndTilt: arr,
                      ID:"VideoHotSpot"
                    });
                  }
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

      var fov = camera.fov + event.deltaY * 0.05;
      camera.fov = THREE.Math.clamp( fov, 10, 75 );
      camera.updateProjectionMatrix();
      let star = camera.fov;
      console.log("star"+star);
      console.log(window.innerWidth +","+ window.innerHeight);
      // camera.fov += event.deltaY * 0.05;
      // if (camera.fov >= 10 && camera.fov <= 110) {
      //   camera.updateProjectionMatrix();//projectionMatrix — 投影变换矩阵
      // }
    },
    animate() {
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
      theta = THREE.Math.degToRad(lon);//degToRad()方法返回与参数degrees所表示的角度相等的弧度值
      camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
    renderer.render(scene, camera);
    },
    //将x,y,z转化为pan和tilt
    calculatePanandTilt(xAverage, yAverage, zAverage) {
      let pan = 0;
      let tilt = 0;
      //计算出配置文件中热点的位置
      if (-xAverage > 0 && zAverage <= 0) {//第三象限
        pan = (Math.atan(zAverage / -xAverage) * 180) / Math.PI;
      }
      if (-xAverage < 0 && zAverage < 0) {//第四象限
        pan = (Math.atan(zAverage / -xAverage) * 180) / Math.PI - 180;
      }
      if (-xAverage > 0 && zAverage >= 0) {//第二象限
        pan = (Math.atan(zAverage / -xAverage) * 180) / Math.PI;
      }
      if (-xAverage < 0 && zAverage > 0) {//第一象限
        pan = 180 + (Math.atan(zAverage / -xAverage) * 180) / Math.PI;
      }
      tilt = (Math.asin(yAverage / 500) * 180) / Math.PI;
      return [pan, tilt];
    },
    //绘制多个跳转热点
    drawJumpHotSpots(variable,newsrc){
      for (let i = 0, len = variable.length; i < len; i++) {
        let position = variable[i].position;
        let canvas = document.createElement("canvas");
        canvas.style.backgroundColor = "rgba(255,255,255,0)";
        let context = canvas.getContext("2d");
        canvas.width = 128;
        canvas.height = 128;
        let img = new Image();
        //这里发布的时候会出现http://localhost:8083/web/dist/static/textures/hotspot.svg
        img.src = newsrc;
        //publish
        //img.src = 'textures/hotspot.svg';
        img.onload = function() {
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
          var endV = new THREE.Vector3(
            position[0] * rate,
            position[1] * rate,
            position[2] * rate
          );
          sprite.position.copy(endV);
          scene.add(sprite);
        };
      }
    },
    //绘制单个跳转热点
    drawJumpHotSpot(variablePosition,newsrc){
        let position = variablePosition;
        let canvas = document.createElement("canvas");
        canvas.style.backgroundColor = "rgba(255,255,255,0)";
        let context = canvas.getContext("2d");
        canvas.width = 128;
        canvas.height = 128;
        let img = new Image();
        //这里发布的时候会出现http://localhost:8083/web/dist/static/textures/hotspot.svg
        img.src = newsrc;
        //publish
        //img.src = 'textures/hotspot.svg';
        img.onload = function() {
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
          var endV = new THREE.Vector3(
            position[0] * rate,
            position[1] * rate,
            position[2] * rate
          );
          sprite.position.copy(endV);
          scene.add(sprite);
        };
    },
    //绘制多个图像热点(Normal)
    drawImageHotSpots(variable){
      for (let j = 0, len = variable.length; j < len; j++) {
        let position = variable[j].position;
        let v1 = new THREE.Vector3(position[0].x, position[0].y, position[0].z);
        let v2 = new THREE.Vector3(position[1].x, position[1].y, position[1].z);
        let v3 = new THREE.Vector3(position[2].x, position[2].y, position[2].z);
        let v4 = new THREE.Vector3(position[3].x, position[3].y, position[3].z);
        //画三角面片
        let geom = new THREE.Geometry();
        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);
        geom.vertices.push(v4);

        let p0 = [position[0].x, position[0].y, position[0].z];
        let p1 = [position[1].x, position[1].y, position[1].z];
        let p2 = [position[2].x, position[2].y, position[2].z];
        let p3 = [position[3].x, position[3].y, position[3].z];
        let d01 =
          (p1[0] - p0[0]) * (p1[0] - p0[0]) +
          (p1[1] - p0[1]) * (p1[1] - p0[1]) +
          (p1[2] - p0[2]) * (p1[2] - p0[2]);
        let d02 =
          (p2[0] - p0[0]) * (p2[0] - p0[0]) +
          (p2[1] - p0[1]) * (p2[1] - p0[1]) +
          (p2[2] - p0[2]) * (p2[2] - p0[2]);
        let d03 =
          (p3[0] - p0[0]) * (p3[0] - p0[0]) +
          (p3[1] - p0[1]) * (p3[1] - p0[1]) +
          (p3[2] - p0[2]) * (p3[2] - p0[2]);
        let max = Math.max(d01, d02, d03);
        let normal = geom.computeFaceNormals();

        function angleCalculation(a,b,c) {
          //把a三维向量复制给vn
          let vn = a.clone();
          //求得vn和b的叉乘
          vn.cross( b );
          //将vn单位化
          vn.normalize();
          //把vn和c两个向量相乘
          let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
          //用向量乘积除以对应向量的模得到夹角
          return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
        }

        if (max === d01) {

          let angle=angleCalculation(v1,v2,v3);
          if(angle>0){
            //2在下方
            geom.faces.push(new THREE.Face3(0, 2, 1, normal));
            geom.faces.push(new THREE.Face3(1, 3, 0, normal));
          }else{
            //2在上方
            geom.faces.push(new THREE.Face3(1, 2, 0, normal));
            geom.faces.push(new THREE.Face3(0, 3, 1, normal));
          }

        }
        if (max === d02) {

          let angle=angleCalculation(v1,v3,v2);
          if(angle>0){
            //1在下方
            geom.faces.push(new THREE.Face3(0, 1, 2, normal));
            geom.faces.push(new THREE.Face3(2, 3, 0, normal));
          }else{
            //1在上方
            geom.faces.push(new THREE.Face3(0, 3, 2, normal));
            geom.faces.push(new THREE.Face3(2, 1, 0, normal));
          }

        }
        if (max === d03) {

          let angle=angleCalculation(v1,v4,v2);
          if(angle>0){
            //1在下方
            geom.faces.push(new THREE.Face3(0, 1, 3, normal));
            geom.faces.push(new THREE.Face3(3, 2, 0, normal));
          }else{
            //1在上方
            geom.faces.push(new THREE.Face3(0, 2, 3, normal));
            geom.faces.push(new THREE.Face3(3, 1, 0, normal));
          }

        }

        geom.computeFaceNormals();
        let material = new THREE.MeshNormalMaterial({ flatShading: true });
        material.transparent = true;
        material.opacity = 0.4;
        let object = new THREE.Mesh(geom, material);
        scene.add(object);
      }
    },
    //绘制单个图像热点(Normal)
    drawImageHotSpot(variablePosition){
      let position = variablePosition;
      let v1 = new THREE.Vector3(position[0].x, position[0].y, position[0].z);
      let v2 = new THREE.Vector3(position[1].x, position[1].y, position[1].z);
      let v3 = new THREE.Vector3(position[2].x, position[2].y, position[2].z);
      let v4 = new THREE.Vector3(position[3].x, position[3].y, position[3].z);
      //画三角面片
      let geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [position[0].x, position[0].y, position[0].z];
      let p1 = [position[1].x, position[1].y, position[1].z];
      let p2 = [position[2].x, position[2].y, position[2].z];
      let p3 = [position[3].x, position[3].y, position[3].z];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }

      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }

      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }

      }

      geom.computeFaceNormals();

      let material = new THREE.MeshNormalMaterial({ flatShading: true });
      material.transparent = true;
      material.opacity = 0.4;
      let object = new THREE.Mesh(geom, material);
      scene.add(object);
    },
    //绘制单个图像热点(Lambert)
    drawNewImageHotSpot(variablePosition){
      let position = variablePosition;
      let v1 = new THREE.Vector3(position[0].x, position[0].y, position[0].z);
      let v2 = new THREE.Vector3(position[1].x, position[1].y, position[1].z);
      let v3 = new THREE.Vector3(position[2].x, position[2].y, position[2].z);
      let v4 = new THREE.Vector3(position[3].x, position[3].y, position[3].z);
      //画三角面片
      let geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [position[0].x, position[0].y, position[0].z];
      let p1 = [position[1].x, position[1].y, position[1].z];
      let p2 = [position[2].x, position[2].y, position[2].z];
      let p3 = [position[3].x, position[3].y, position[3].z];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }

      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }

      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }

      }

      geom.computeFaceNormals();

      let material = new THREE.MeshLambertMaterial({color:0x0000ff});
      material.transparent = true;
      material.opacity = 0.4;
      let object = new THREE.Mesh(geom, material);
      scene.add(object);
    },
    //删除跳转热点
    deleteJumpHotSpot(pattern){
      for (let j = 0; j < scene.children.length; j++) {
        if (scene.children[j].type.toLowerCase() === "sprite") {
          if (Math.round(scene.children[j].position.x * 1.25) === Math.round(pattern.position[0]) &&
            Math.round(scene.children[j].position.y * 1.25) === Math.round(pattern.position[1]) &&
            Math.round(scene.children[j].position.z * 1.25) === Math.round(pattern.position[2])) {
            scene.children.splice(j, 1);
            this.$store.commit("deletedHotSpot");
            this.$store.commit("hideHotSpot");
          }
        }
      }
    },
    //删除图像热点
    deleteImageHotSpot(pattern) {
      for (let j = 0; j < scene.children.length; j++) {
        if (scene.children[j].type.toLowerCase() === "mesh") {
          if (Math.round(scene.children[j].geometry.vertices[0].x)===Math.round(pattern.position[0].x) &&
            Math.round(scene.children[j].geometry.vertices[1].x)===Math.round(pattern.position[1].x) &&
            Math.round(scene.children[j].geometry.vertices[2].x)===Math.round(pattern.position[2].x) &&
            Math.round(scene.children[j].geometry.vertices[3].x)===Math.round(pattern.position[3].x)){
            scene.children.splice(j, 1);
            this.$store.commit("deletedHotSpot");
            this.$store.commit("hideHotSpot");
          }
        }
      }
    },
    //绘制新的videoHotspot热点
    drawVideoHotSpot(oldselected){

      let selected = {};
      let that = this;

      selected = select(160,120);
      //console.log(selected);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(-160,-120);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(-160,120);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(160,-120);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);

      //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四变形
      function select(height,width) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((oldselected.client[0] - 320 + height) / (window.innerWidth - 340)) * 2 - 1,
          -((oldselected.client[1] - 70 + width) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        //标准设备坐标vector
        //console.log(vector);
        that.$store.commit("saveVideoGroup",vector);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        //球体上的坐标
        //console.log(selectPoint);

        return selectPoint;
      }



      var v1 = new THREE.Vector3(
        xPositionArr[0],
        yPositionArr[0],
        zPositionArr[0]
      );
      var v2 = new THREE.Vector3(
        xPositionArr[1],
        yPositionArr[1],
        zPositionArr[1]
      );
      var v3 = new THREE.Vector3(
        xPositionArr[2],
        yPositionArr[2],
        zPositionArr[2]
      );
      var v4 = new THREE.Vector3(
        xPositionArr[3],
        yPositionArr[3],
        zPositionArr[3]
      );
      //画三角面片
      var geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
      let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
      let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
      let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }
      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }
      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }
      }

      let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
      material.transparent = true;
      material.opacity = 0.8;
      let object = new THREE.Mesh(geom, material);
      console.log("old:");
      console.log(object);
      uuid = object.uuid;

      scene.add(object);

      xPositionArr = [];
      yPositionArr = [];
      zPositionArr = [];
    },
    //绘制旋转之后的videoHotspot热点
    drawRotateVideoHotSpot(oldselected,theta){

      let selected = {};

      let rotatex1 = 200*Math.cos(Math.atan(3/4)+theta/180*Math.PI);//160
      let rotatey1 = 200*Math.sin(Math.atan(3/4)+theta/180*Math.PI);//120
      let rotatex2 = 200*Math.cos((Math.PI-Math.atan(3/4))+theta/180*Math.PI);//160
      let rotatey2 = 200*Math.sin((Math.PI-Math.atan(3/4))+theta/180*Math.PI);//120
      let rotatex3 = 200*Math.cos((Math.PI+Math.atan(3/4))+theta/180*Math.PI);//160
      let rotatey3 = 200*Math.sin((Math.PI+Math.atan(3/4))+theta/180*Math.PI);//120
      let rotatex4 = 200*Math.cos(-Math.atan(3/4)+theta/180*Math.PI);//160
      let rotatey4 = 200*Math.sin(-Math.atan(3/4)+theta/180*Math.PI);//120

      selected = select(rotatex1,rotatey1);
      //console.log(selected);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(rotatex3,rotatey3);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(rotatex2,rotatey2);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(rotatex4,rotatey4);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);

      //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四变形
      function select(height,width) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((oldselected.client[0] - 320 + height) / (window.innerWidth - 340)) * 2 - 1,
          -((oldselected.client[1] - 70 + width) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);
        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];
        return selectPoint;
      }

      var v1 = new THREE.Vector3(
        xPositionArr[0],
        yPositionArr[0],
        zPositionArr[0]
      );
      var v2 = new THREE.Vector3(
        xPositionArr[1],
        yPositionArr[1],
        zPositionArr[1]
      );
      var v3 = new THREE.Vector3(
        xPositionArr[2],
        yPositionArr[2],
        zPositionArr[2]
      );
      var v4 = new THREE.Vector3(
        xPositionArr[3],
        yPositionArr[3],
        zPositionArr[3]
      );
      //画三角面片
      var geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
      let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
      let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
      let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }
      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }
      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }
      }

      let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
      material.transparent = true;
      material.opacity = 0.8;
      let object = new THREE.Mesh(geom, material);
      uuid = object.uuid;

      scene.add(object);

      xPositionArr = [];
      yPositionArr = [];
      zPositionArr = [];
    },
    //绘制缩放的videoHotspot热点
    drawScaleVideoHotSpot(oldselected,scale){

      let selected = {};

      selected = select(160*scale,120*scale);
      // console.log(selected);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(-160*scale,-120*scale);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(-160*scale,120*scale);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      selected = select(160*scale,-120*scale);
      xPositionArr.push(selected.point.x);
      yPositionArr.push(selected.point.y);
      zPositionArr.push(selected.point.z);
      // console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);

      //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四变形
      function select(height,width) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((oldselected.client[0] - 320 + height) / (window.innerWidth - 340)) * 2 - 1,
          -((oldselected.client[1] - 70 + width) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);
        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];
        return selectPoint;
      }



      var v1 = new THREE.Vector3(
        xPositionArr[0],
        yPositionArr[0],
        zPositionArr[0]
      );
      var v2 = new THREE.Vector3(
        xPositionArr[1],
        yPositionArr[1],
        zPositionArr[1]
      );
      var v3 = new THREE.Vector3(
        xPositionArr[2],
        yPositionArr[2],
        zPositionArr[2]
      );
      var v4 = new THREE.Vector3(
        xPositionArr[3],
        yPositionArr[3],
        zPositionArr[3]
      );
      //画三角面片
      var geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
      let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
      let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
      let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }
      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }
      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }
      }

      let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
      material.transparent = true;
      material.opacity = 0.8;
      let object = new THREE.Mesh(geom, material);
      uuid = object.uuid;

      scene.add(object);

      xPositionArr = [];
      yPositionArr = [];
      zPositionArr = [];
    },

    //屏幕二维坐标转为世界系坐标
    deviceCoordinates(screen) {
      let vector = new THREE.Vector3();
      vector.set(
        //注意：这里是根据render的size来确定的
        ((screen.x - 320) / (window.innerWidth - 340)) * 2 - 1,
        -((screen.y - 70) / (window.innerHeight - 90)) * 2 + 1,
        0.5
      );
      //console.log(((oldselected.client[0] - 320) / (window.innerWidth - 340)) * 2 - 1);
      //console.log(-((oldselected.client[1] - 70) / (window.innerHeight - 90)) * 2 + 1);
      vector.unproject(camera);
      //世界系坐标vector
      //console.log(vector);
      return vector;
    },
    //世界系坐标转为屏幕二维坐标
    screenCoordinates(vector){
      vector.project(camera);
      let screen ={x:0,y:0};
      screen.x = Math.round(((vector.x + 1) / 2)* (window.innerWidth - 340) + 320);
      screen.y = Math.round((-1) * ((vector.y - 1) / 2) * (window.innerHeight - 90) + 70);
      // console.log(vector);
      // console.log("x:"+Math.round(((vector.x + 1) / 2)* (window.innerWidth - 340) + 320));
      // console.log("y:"+Math.round((-1) * ((vector.y - 1) / 2) * (window.innerHeight - 90) + 70));
      return screen;
    },


    //能够实现鼠标拖拽或者放缩不更改热点形状

    //     newDrawVideoHotSpot(){
    //       let selected = {};
    //       let that = this;
    //       let selectArray = [];
    //
    //       console.log(that.$store.state.test.videoGroup);
    //
    //       if(that.$store.state.test.videoGroup.length === 4){
    //         for (let i = 0; i < 4; i++) {
    //           selectArray.push(that.screenCoordinates(that.$store.state.test.videoGroup[i]));
    //         }
    //       }
    //       console.log(selectArray);
    //
    //       for (let i = 0; i < 4; i++) {
    //         selected = select(selectArray[i]);
    //         //console.log(selected);
    //         xPositionArr.push(selected.point.x);
    //         yPositionArr.push(selected.point.y);
    //         zPositionArr.push(selected.point.z);
    //         //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
    //       }
    //
    //       //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四变形
    //       function select(array) {
    //         let vector = new THREE.Vector3();
    //         vector.set(
    //           //注意：这里是根据render的size来确定的
    //           ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
    //           -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
    //           0.5
    //         );
    //         vector.unproject(camera);
    //
    //         //标准设备坐标vector
    //         //console.log(vector);
    //
    //         let raycaster = new THREE.Raycaster(
    //           camera.position,
    //           vector.sub(camera.position).normalize()//初始化
    //         );
    //         raycaster.set(camera.position,vector.sub(camera.position).normalize());
    //         let intersects = raycaster.intersectObjects(scene.children);
    //
    //         let selectPoint = intersects[0];
    //
    //         //球体上的坐标
    //         //console.log(selectPoint);
    //
    //         return selectPoint;
    //       }
    //
    //
    //
    //       var v1 = new THREE.Vector3(
    //         xPositionArr[0],
    //         yPositionArr[0],
    //         zPositionArr[0]
    //       );
    //       var v2 = new THREE.Vector3(
    //         xPositionArr[1],
    //         yPositionArr[1],
    //         zPositionArr[1]
    //       );
    //       var v3 = new THREE.Vector3(
    //         xPositionArr[2],
    //         yPositionArr[2],
    //         zPositionArr[2]
    //       );
    //       var v4 = new THREE.Vector3(
    //         xPositionArr[3],
    //         yPositionArr[3],
    //         zPositionArr[3]
    //       );
    //       //画三角面片
    //       var geom = new THREE.Geometry();
    //       geom.vertices.push(v1);
    //       geom.vertices.push(v2);
    //       geom.vertices.push(v3);
    //       geom.vertices.push(v4);
    //
    //       let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
    //       let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
    //       let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
    //       let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
    //       let d01 =
    //         (p1[0] - p0[0]) * (p1[0] - p0[0]) +
    //         (p1[1] - p0[1]) * (p1[1] - p0[1]) +
    //         (p1[2] - p0[2]) * (p1[2] - p0[2]);
    //       let d02 =
    //         (p2[0] - p0[0]) * (p2[0] - p0[0]) +
    //         (p2[1] - p0[1]) * (p2[1] - p0[1]) +
    //         (p2[2] - p0[2]) * (p2[2] - p0[2]);
    //       let d03 =
    //         (p3[0] - p0[0]) * (p3[0] - p0[0]) +
    //         (p3[1] - p0[1]) * (p3[1] - p0[1]) +
    //         (p3[2] - p0[2]) * (p3[2] - p0[2]);
    //       let max = Math.max(d01, d02, d03);
    //       let normal = geom.computeFaceNormals();
    //
    //       function angleCalculation(a,b,c) {
    //         //把a三维向量复制给vn
    //         let vn = a.clone();
    //         //求得vn和b的叉乘
    //         vn.cross( b );
    //         //将vn单位化
    //         vn.normalize();
    //         //把vn和c两个向量相乘
    //         let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
    //         //用向量乘积除以对应向量的模得到夹角
    //         return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
    //       }
    //
    //       if (max === d01) {
    //
    //         let angle=angleCalculation(v1,v2,v3);
    //         if(angle>0){
    //           //2在下方
    //           geom.faces.push(new THREE.Face3(0, 2, 1, normal));
    //           geom.faces.push(new THREE.Face3(1, 3, 0, normal));
    //         }else{
    //           //2在上方
    //           geom.faces.push(new THREE.Face3(1, 2, 0, normal));
    //           geom.faces.push(new THREE.Face3(0, 3, 1, normal));
    //         }
    //       }
    //       if (max === d02) {
    //
    //         let angle=angleCalculation(v1,v3,v2);
    //         if(angle>0){
    //           //1在下方
    //           geom.faces.push(new THREE.Face3(0, 1, 2, normal));
    //           geom.faces.push(new THREE.Face3(2, 3, 0, normal));
    //         }else{
    //           //1在上方
    //           geom.faces.push(new THREE.Face3(0, 3, 2, normal));
    //           geom.faces.push(new THREE.Face3(2, 1, 0, normal));
    //         }
    //       }
    //       if (max === d03) {
    //
    //         let angle=angleCalculation(v1,v4,v2);
    //         if(angle>0){
    //           //1在下方
    //           geom.faces.push(new THREE.Face3(0, 1, 3, normal));
    //           geom.faces.push(new THREE.Face3(3, 2, 0, normal));
    //         }else{
    //           //1在上方
    //           geom.faces.push(new THREE.Face3(0, 2, 3, normal));
    //           geom.faces.push(new THREE.Face3(3, 1, 0, normal));
    //         }
    //       }
    //
    //       let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
    //       material.transparent = true;
    //       material.opacity = 0.8;
    //       let object = new THREE.Mesh(geom, material);
    //       console.log("new:");
    //       console.log(object);
    //       uuid = object.uuid;
    //
    //       scene.add(object);
    //
    //       xPositionArr = [];
    //       yPositionArr = [];
    //       zPositionArr = [];
    // },

    //需要实现鼠标拖拽或者放缩之后能更改热点的平移位置,旋转以及缩放
    newDrawVideoHotSpotX(oldselected,params){
      console.log(params);
      let selected = {};
      let that = this;
      let selectArray = [];

      console.log(that.$store.state.test.videoGroup);
      //将保存的三维世界坐标数组转为二维屏幕坐标数组
      if(that.$store.state.test.videoGroup.length === 4){
        for (let i = 0; i < 4; i++) {
          selectArray.push(that.screenCoordinates(that.$store.state.test.videoGroup[i]));
        }
      }
      console.log(selectArray);

      //进行平移操作(这是平移1个单位)
      for (let i = 0; i < 4; i++) {
        selectArray[i].x += params;
      }
      //将三维世界坐标数组清空
      this.$store.commit("emptyVideoGroup");
      //用新的二维坐标数组进行重新计算并绘制
      for (let i = 0; i < 4; i++) {
        selected = select(selectArray[i]);
        console.log(selected);
        xPositionArr.push(selected.point.x);
        yPositionArr.push(selected.point.y);
        zPositionArr.push(selected.point.z);
        //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      }

      //把中心点的向量带入转换函数变为屏幕二维坐标，并加上平移量
      let client = this.screenCoordinates(oldselected.vector);
      //把中心点进行平移
      client.x += params;
      //把屏幕坐标变换为三维世界坐标并更新
      let worldDevice = this.deviceCoordinates(client);
      this.$store.commit("saveOldselectedVector",worldDevice.clone());
      //把屏幕坐标转换为球上的交叉点坐标，不过与select不同，这个不需要commit
      let world = newselect(client);
      let worldArray = [world.point.x,world.point.y,world.point.z];
      //再把三维球坐标更新即可
      this.$store.commit("saveOldselectedSelect",worldArray);


      function newselect(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        return selectPoint;
      }
      //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四边形
      function select(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        //标准设备坐标vector
        //console.log(vector);
        that.$store.commit("saveVideoGroup",vector);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        //球体上的坐标
        //console.log(selectPoint);

        return selectPoint;
      }

      var v1 = new THREE.Vector3(
        xPositionArr[0],
        yPositionArr[0],
        zPositionArr[0]
      );
      var v2 = new THREE.Vector3(
        xPositionArr[1],
        yPositionArr[1],
        zPositionArr[1]
      );
      var v3 = new THREE.Vector3(
        xPositionArr[2],
        yPositionArr[2],
        zPositionArr[2]
      );
      var v4 = new THREE.Vector3(
        xPositionArr[3],
        yPositionArr[3],
        zPositionArr[3]
      );
      //画三角面片
      var geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
      let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
      let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
      let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }
      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }
      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }
      }

      let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
      material.transparent = true;
      material.opacity = 0.8;
      let object = new THREE.Mesh(geom, material);
      console.log("new:");
      console.log(object);
      uuid = object.uuid;

      scene.add(object);

      xPositionArr = [];
      yPositionArr = [];
      zPositionArr = [];
    },
    newDrawVideoHotSpotY(oldselected,params){
      console.log(params);
      let selected = {};
      let that = this;
      let selectArray = [];

      console.log(that.$store.state.test.videoGroup);
      //将保存的三维世界坐标数组转为二维屏幕坐标数组
      if(that.$store.state.test.videoGroup.length === 4){
        for (let i = 0; i < 4; i++) {
          selectArray.push(that.screenCoordinates(that.$store.state.test.videoGroup[i]));
        }
      }
      console.log(selectArray);

      //进行平移操作(这是平移1个单位)
      for (let i = 0; i < 4; i++) {
        selectArray[i].y += params;
      }
      //将三维世界坐标数组清空
      this.$store.commit("emptyVideoGroup");
      //用新的二维坐标数组进行重新计算并绘制
      for (let i = 0; i < 4; i++) {
        selected = select(selectArray[i]);
        console.log(selected);
        xPositionArr.push(selected.point.x);
        yPositionArr.push(selected.point.y);
        zPositionArr.push(selected.point.z);
        //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      }

      //把中心点的向量带入转换函数变为屏幕二维坐标，并加上平移量
      let client = this.screenCoordinates(oldselected.vector);
      //把中心点进行平移
      client.y += params;
      //把屏幕坐标变换为三维世界坐标并更新
      let worldDevice = this.deviceCoordinates(client);
      this.$store.commit("saveOldselectedVector",worldDevice.clone());
      //把屏幕坐标转换为球上的交叉点坐标，不过与select不同，这个不需要commit
      let world = newselect(client);
      let worldArray = [world.point.x,world.point.y,world.point.z];
      //再把三维球坐标更新即可
      this.$store.commit("saveOldselectedSelect",worldArray);


      function newselect(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        return selectPoint;
      }
      //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四边形
      function select(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        //标准设备坐标vector
        //console.log(vector);
        that.$store.commit("saveVideoGroup",vector);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        //球体上的坐标
        //console.log(selectPoint);

        return selectPoint;
      }

      var v1 = new THREE.Vector3(
        xPositionArr[0],
        yPositionArr[0],
        zPositionArr[0]
      );
      var v2 = new THREE.Vector3(
        xPositionArr[1],
        yPositionArr[1],
        zPositionArr[1]
      );
      var v3 = new THREE.Vector3(
        xPositionArr[2],
        yPositionArr[2],
        zPositionArr[2]
      );
      var v4 = new THREE.Vector3(
        xPositionArr[3],
        yPositionArr[3],
        zPositionArr[3]
      );
      //画三角面片
      var geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
      let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
      let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
      let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }
      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }
      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }
      }

      let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
      material.transparent = true;
      material.opacity = 0.8;
      let object = new THREE.Mesh(geom, material);
      console.log("new:");
      console.log(object);
      uuid = object.uuid;

      scene.add(object);

      xPositionArr = [];
      yPositionArr = [];
      zPositionArr = [];
    },
    newDrawVideoHotSpotR(oldselected,theta){
      let selected = {};
      let that = this;
      let selectArray = [];

      //将保存的三维世界坐标数组转为二维屏幕坐标数组
      if(that.$store.state.test.videoGroup.length === 4){
        for (let i = 0; i < 4; i++) {
          selectArray.push(that.screenCoordinates(that.$store.state.test.videoGroup[i]));
        }
      }
      console.log(selectArray);

      //把中心点的向量带入转换函数变为屏幕二维坐标
      let client = this.screenCoordinates(oldselected.vector);
      //把中心点进行平移
      console.log(client);
      //把屏幕坐标变换为三维世界坐标并更新
      let worldDevice = this.deviceCoordinates(client);
      this.$store.commit("saveOldselectedVector",worldDevice.clone());
      //把屏幕坐标转换为球上的交叉点坐标，不过与select不同，这个不需要commit
      let world = newselect(client);
      let worldArray = [world.point.x,world.point.y,world.point.z];
      //再把三维球坐标更新即可
      this.$store.commit("saveOldselectedSelect",worldArray);

      //进行旋转操作,200存在问题
      let newselectArray = [];
      for (let i = 0; i < selectArray.length; i++) {
        let obj = {};
        obj.x = selectArray[i].x - client.x;
        obj.y = selectArray[i].y - client.y;
        newselectArray.push(obj);
      }
      console.log(newselectArray);

      // let distance = [];
      // let thetaArray = [];
      // for (let i = 0; i < selectArray.length; i++) {
      //   distance[i] = Math.pow((Math.pow((client.x-selectArray[i].x),2)+Math.pow((client.y-selectArray[i].y),2)),1/2);
      //   thetaArray[i] = (selectArray[i].x-client.x)/(selectArray[i].y-client.y);
      //   console.log(distance[i]+""+thetaArray[i]);
      //   console.log(selectArray[i]);
      //   selectArray[i].x = client.x + distance[i]*Math.cos(Math.atan(thetaArray[i])+theta/180*Math.PI);
      //   selectArray[i].y = client.y + distance[i]*Math.sin(Math.atan(thetaArray[i])+theta/180*Math.PI);
      //   console.log(selectArray[i]);
      // }

      // selectArray[0].x += 200*Math.cos(Math.atan(3/4)+theta/180*Math.PI);//160
      // selectArray[0].y += 200*Math.sin(Math.atan(3/4)+theta/180*Math.PI);//120
      // selectArray[1].x += 200*Math.cos((Math.PI-Math.atan(3/4))+theta/180*Math.PI);//160
      // selectArray[1].y += 200*Math.sin((Math.PI-Math.atan(3/4))+theta/180*Math.PI);//120
      // selectArray[2].x += 200*Math.cos((Math.PI+Math.atan(3/4))+theta/180*Math.PI);//160
      // selectArray[2].y += 200*Math.sin((Math.PI+Math.atan(3/4))+theta/180*Math.PI);//120
      // selectArray[3].x += 200*Math.cos(-Math.atan(3/4)+theta/180*Math.PI);//160
      // selectArray[3].y += 200*Math.sin(-Math.atan(3/4)+theta/180*Math.PI);//120

      console.log(selectArray);

      //将三维世界坐标数组清空
      this.$store.commit("emptyVideoGroup");
      //用新的二维坐标数组进行重新计算并绘制
      for (let i = 0; i < 4; i++) {
        selected = select(selectArray[i]);
        //console.log(selected);
        xPositionArr.push(selected.point.x);
        yPositionArr.push(selected.point.y);
        zPositionArr.push(selected.point.z);
        //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      }

      function newselect(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        return selectPoint;
      }
      //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四边形
      function select(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        //标准设备坐标vector
        //console.log(vector);
        that.$store.commit("saveVideoGroup",vector);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        //球体上的坐标
        //console.log(selectPoint);

        return selectPoint;
      }

      var v1 = new THREE.Vector3(
        xPositionArr[0],
        yPositionArr[0],
        zPositionArr[0]
      );
      var v2 = new THREE.Vector3(
        xPositionArr[1],
        yPositionArr[1],
        zPositionArr[1]
      );
      var v3 = new THREE.Vector3(
        xPositionArr[2],
        yPositionArr[2],
        zPositionArr[2]
      );
      var v4 = new THREE.Vector3(
        xPositionArr[3],
        yPositionArr[3],
        zPositionArr[3]
      );
      //画三角面片
      var geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
      let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
      let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
      let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }
      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }
      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }
      }

      let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
      material.transparent = true;
      material.opacity = 0.8;
      let object = new THREE.Mesh(geom, material);
      console.log("new:");
      console.log(object);
      uuid = object.uuid;

      scene.add(object);

      xPositionArr = [];
      yPositionArr = [];
      zPositionArr = [];
    },
    newDrawVideoHotSpotS(oldselected,params){
      console.log(params);
      let selected = {};
      let that = this;
      let selectArray = [];

      console.log(that.$store.state.test.videoGroup);
      //将保存的三维世界坐标数组转为二维屏幕坐标数组
      if(that.$store.state.test.videoGroup.length === 4){
        for (let i = 0; i < 4; i++) {
          selectArray.push(that.screenCoordinates(that.$store.state.test.videoGroup[i]));
        }
      }
      console.log(selectArray);

      //进行平移操作(这是平移1个单位)
      for (let i = 0; i < 4; i++) {
        selectArray[i].y += params;
      }
      //将三维世界坐标数组清空
      this.$store.commit("emptyVideoGroup");
      //用新的二维坐标数组进行重新计算并绘制
      for (let i = 0; i < 4; i++) {
        selected = select(selectArray[i]);
        console.log(selected);
        xPositionArr.push(selected.point.x);
        yPositionArr.push(selected.point.y);
        zPositionArr.push(selected.point.z);
        //console.log(selected.point.x + "," + selected.point.y + "," + selected.point.z);
      }

      //把中心点的向量带入转换函数变为屏幕二维坐标，并加上平移量
      let client = this.screenCoordinates(oldselected.vector);
      //把中心点进行平移
      client.y += params;
      //把屏幕坐标变换为三维世界坐标并更新
      let worldDevice = this.deviceCoordinates(client);
      this.$store.commit("saveOldselectedVector",worldDevice.clone());
      //把屏幕坐标转换为球上的交叉点坐标，不过与select不同，这个不需要commit
      let world = newselect(client);
      let worldArray = [world.point.x,world.point.y,world.point.z];
      //再把三维球坐标更新即可
      this.$store.commit("saveOldselectedSelect",worldArray);


      function newselect(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        return selectPoint;
      }
      //视频像素大小对应为屏幕的像素大小，传入屏幕二维坐标更新射线就可以获得对应的四边形
      function select(array) {
        let vector = new THREE.Vector3();
        vector.set(
          //注意：这里是根据render的size来确定的
          ((array.x - 320 ) / (window.innerWidth - 340)) * 2 - 1,
          -((array.y - 70 ) / (window.innerHeight - 90)) * 2 + 1,
          0.5
        );
        vector.unproject(camera);

        //标准设备坐标vector
        //console.log(vector);
        that.$store.commit("saveVideoGroup",vector);

        let raycaster = new THREE.Raycaster(
          camera.position,
          vector.sub(camera.position).normalize()//初始化
        );
        raycaster.set(camera.position,vector.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        let selectPoint = intersects[0];

        //球体上的坐标
        //console.log(selectPoint);

        return selectPoint;
      }

      var v1 = new THREE.Vector3(
        xPositionArr[0],
        yPositionArr[0],
        zPositionArr[0]
      );
      var v2 = new THREE.Vector3(
        xPositionArr[1],
        yPositionArr[1],
        zPositionArr[1]
      );
      var v3 = new THREE.Vector3(
        xPositionArr[2],
        yPositionArr[2],
        zPositionArr[2]
      );
      var v4 = new THREE.Vector3(
        xPositionArr[3],
        yPositionArr[3],
        zPositionArr[3]
      );
      //画三角面片
      var geom = new THREE.Geometry();
      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);

      let p0 = [xPositionArr[0], yPositionArr[0], zPositionArr[0]];
      let p1 = [xPositionArr[1], yPositionArr[1], zPositionArr[1]];
      let p2 = [xPositionArr[2], yPositionArr[2], zPositionArr[2]];
      let p3 = [xPositionArr[3], yPositionArr[3], zPositionArr[3]];
      let d01 =
        (p1[0] - p0[0]) * (p1[0] - p0[0]) +
        (p1[1] - p0[1]) * (p1[1] - p0[1]) +
        (p1[2] - p0[2]) * (p1[2] - p0[2]);
      let d02 =
        (p2[0] - p0[0]) * (p2[0] - p0[0]) +
        (p2[1] - p0[1]) * (p2[1] - p0[1]) +
        (p2[2] - p0[2]) * (p2[2] - p0[2]);
      let d03 =
        (p3[0] - p0[0]) * (p3[0] - p0[0]) +
        (p3[1] - p0[1]) * (p3[1] - p0[1]) +
        (p3[2] - p0[2]) * (p3[2] - p0[2]);
      let max = Math.max(d01, d02, d03);
      let normal = geom.computeFaceNormals();

      function angleCalculation(a,b,c) {
        //把a三维向量复制给vn
        let vn = a.clone();
        //求得vn和b的叉乘
        vn.cross( b );
        //将vn单位化
        vn.normalize();
        //把vn和c两个向量相乘
        let vn2= vn.x*c.x+vn.y*c.y+vn.z*c.z;
        //用向量乘积除以对应向量的模得到夹角
        return (vn2/(Math.sqrt(c.x*c.x+c.y*c.y+c.z*c.z)));
      }

      if (max === d01) {

        let angle=angleCalculation(v1,v2,v3);
        if(angle>0){
          //2在下方
          geom.faces.push(new THREE.Face3(0, 2, 1, normal));
          geom.faces.push(new THREE.Face3(1, 3, 0, normal));
        }else{
          //2在上方
          geom.faces.push(new THREE.Face3(1, 2, 0, normal));
          geom.faces.push(new THREE.Face3(0, 3, 1, normal));
        }
      }
      if (max === d02) {

        let angle=angleCalculation(v1,v3,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 2, normal));
          geom.faces.push(new THREE.Face3(2, 3, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 3, 2, normal));
          geom.faces.push(new THREE.Face3(2, 1, 0, normal));
        }
      }
      if (max === d03) {

        let angle=angleCalculation(v1,v4,v2);
        if(angle>0){
          //1在下方
          geom.faces.push(new THREE.Face3(0, 1, 3, normal));
          geom.faces.push(new THREE.Face3(3, 2, 0, normal));
        }else{
          //1在上方
          geom.faces.push(new THREE.Face3(0, 2, 3, normal));
          geom.faces.push(new THREE.Face3(3, 1, 0, normal));
        }
      }

      let material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
      material.transparent = true;
      material.opacity = 0.8;
      let object = new THREE.Mesh(geom, material);
      console.log("new:");
      console.log(object);
      uuid = object.uuid;

      scene.add(object);

      xPositionArr = [];
      yPositionArr = [];
      zPositionArr = [];
    },

  }
};
</script>

<style scoped>
</style>
