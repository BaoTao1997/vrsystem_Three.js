<template>
  <el-menu class="navbar" mode="horizontal">
    <!--<Hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></Hamburger>-->
    <!--<el-submenu v-for="nb in navbar.list" :key="nb.name" :index="nb.name">-->
    <!--<template slot="title">{{nb.text}}</template>-->
    <!--&lt;!&ndash;<el-menu-item v-for="sub in nb.children" :key="sub.name" :index="nb.name" ><input type="file" @click="importFile">{{sub.text}}</el-menu-item>&ndash;&gt;-->
    <!--<el-menu-item v-for="sub in nb.children" :key="sub.name" :index="nb.name" >{{sub.text}}</el-menu-item>-->
    <!--</el-submenu>-->
    <!--2018.5.7添加，实现读取文件的功能-->
    <!-- 新建项目 -->
    <!-- <el-menu-item index='add' type="text" @click="dialogFormVisible = true">新建项目</el-menu-item>
    <el-dialog title="新建项目" :visible.sync="dialogFormVisible">
        <el-form label-position="left" label-width="100px">
                <el-form-item label="项目名称">
                    <el-input size="small" v-model="shortName"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input size="small" v-model="address"></el-input>
                </el-form-item>
                <el-form-item label="经度">
                    <el-input size="small" v-model="longitude"></el-input>
                </el-form-item>
                <el-form-item label="纬度">
                    <el-input size="small" v-model="latitude"></el-input>
                </el-form-item>
                <el-form-item label="补充说明">
                    <el-input type="textarea" v-model="proInfo"></el-input>
                </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="sendProject">确 定</el-button>
        </div>
    </el-dialog> -->

    <el-submenu index="Elements">
      <template slot="title">热点绘制</template>
      <el-menu-item index="Hotspot" @click="drawHotspot">跳转热点</el-menu-item>
      <el-menu-item index="imageHotspot" @click="drawImageHotspot">图像热点</el-menu-item>
      <el-menu-item index="imageHotspot" @click="drawVideoHotspot">视频热点</el-menu-item>
    </el-submenu>

    <el-menu-item index="delete" @click="deleteHotSpot">删除热点</el-menu-item>

    <el-menu-item index="save" @click="saveInformation">保存场景</el-menu-item>
    <el-menu-item index="output" @click="createXmlString">发布</el-menu-item>
    <!-- <ErrLog v-if="log.length>0" class="errLog-container" :logsList="log"></ErrLog> -->
    <el-menu-item index='uerInfo' style="display:absolute;right:-600px;">{{userName}}</el-menu-item>
    <!-- <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
            <img class="user-avatar" :src="avatar+'?imageView2/1/w/80/h/80'">
            <i class="el-icon-caret-bottom"/>
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
            <router-link  class='inlineBlock' to="/">
                <el-dropdown-item>
                    首页
                </el-dropdown-item>
            </router-link>
            <router-link  class='inlineBlock' to="/admin/profile">
                <el-dropdown-item>
                    设置
                </el-dropdown-item>
            </router-link>
            <el-dropdown-item divided><span @click="logout" style="display:block;">退出登录</span></el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown> -->
  </el-menu>
</template>

<script>
  import {mapGetters} from 'vuex';
  import Levelbar from './Levelbar';
  // import Hamburger from 'components/Hamburger';
  // import ErrLog from 'components/ErrLog';
  // import errLogStore from 'store/errLog';
  // import navStore from 'store/modules/nav';

  export default {
    components: {
      Levelbar,
      // Hamburger,
      // ErrLog
    },
    //   mounted(){
    //     let userName=document.getElementById('userID').value;
    //     console.log(userName);
    //   },
    data() {
      return {
        // log: errLogStore.state.errLog,
        // navbar: navStore.navbar,
        fileList: [],
        dialogFormVisible: false,
        shortName: '',
        address: '',
        longitude: '',
        latitude: '',
        proInfo: '',
        //这里暂时写死
        createUserNo: "84d2a1ed-d26e-4772-a296-ce8c111132d4",
        companyNo: "84d2a1ed-d26e-4772-a296-ce8c111132d4",
        token: "4KD8DLL84D2A1ED-D26E-4772-A296-CE8C111132D4",
        formLabelWidth: '120px'
      }
    },
    computed: {
      ...mapGetters([
        'sidebar',
        'name',
        'avatar'
      ]),
      userName() {
        // let userName=document.getElementById('userID').value;
        // console.log(userName);
        // return userName;
      }
    },
    methods: {
      toggleSideBar() {
        this.$store.dispatch('ToggleSideBar')
      },
      logout() {
        this.$store.dispatch('LogOut').then(() => {
          location.reload();// 为了重新实例化vue-router对象 避免bug
        });
      },
      sendProject() {
        this.dialogFormVisible = false;
        let that = this;
        this.$ajax({
          url: '/web/spaceview/',
          method: 'post',
          data: {
            shortName: that.shortName,
            address: that.address,
            longitude: that.longitude,
            latitude: that.latitude,
            info: that.proInfo,
            createUserNo: that.createUserNo,
            companyNo: that.companyNo,
            _token: that.token,
            viewType: 0,
            status: 1
          },
          transformRequest: [function (data) {
            // Do whatever you want to transform the data
            let ret = ''
            for (let it in data) {
              ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
          }],
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        }).then(function (response) {
          let viewNo = response.data.data;
          that.$store.commit('saveViewNo', {viewNo: viewNo});
          console.log(viewNo);

        }).catch(function (error) {
          console.log(error);
        });
      },
      //2018.4.28添加，实现点击element中的Panorama时实现读取全景文件
      //暂时没用到
      // importFile(event){
      //     var fileNameArr=[];
      //     var fileUrlArr=[];
      //   event.target.addEventListener('change', (event) => {
      //       event.preventDefault();
      //       //用于判断是选择了哪种类型，一张图or多张图
      //       let ele=event.target.parentNode.innerHTML.substring(event.target.parentNode.innerHTML.lastIndexOf(">")+1);
      //       var file=event.target.files[0];
      //       var fileName=file.name;
      //       if (window.FileReader) {
      //           var that=this;
      //           var reader = new FileReader();
      //           reader.readAsDataURL(file);
      //           //监听文件读取结束后事件
      //           reader.onloadend = function () {
      //               var fileUrl=reader.result;
      //               fileNameArr.push(fileName);
      //               fileUrlArr.push(fileUrl);
      //               //一张图的情况
      //               if(fileNameArr.length===1&&ele==='Panorama1'){
      //                   that.$store.dispatch('saveimgFile',{fileName:fileNameArr,fileUrl:fileUrlArr});
      //                   return;
      //               }
      //               //六张图的情况
      //               if(fileNameArr.length===6&&ele==='Panorama6'){
      //                   that.$store.dispatch('saveimgFile',{fileName:fileNameArr,fileUrl:fileUrlArr});
      //                   return;
      //               }
      //
      //           };
      //
      //       }
      //   }, false);
      // },


      drawHotspot() {
        this.$store.dispatch('isHotspot');
      },
      drawImageHotspot() {
        this.$store.dispatch('isImageHotspot');
      },
      drawVideoHotspot() {
        this.$store.dispatch('isVideoHotspot');
      },
      //确定按钮会改变state中的isSubmit的状态，从而实现在editor组件中通过监听isSubmit实现同步state中的hotSpots属性
      submitInformation() {
        this.$store.dispatch('isSubmit');
      },
      saveInformation() {
        this.$store.dispatch('saveInformation');
      },
      deleteHotSpot() {
        this.$store.commit('deleteHotSpot');
      },
      //生成xml字符串
      createXmlString() {
        let output = '<?xml version="1.0" encoding="UTF-8"?><tour start="node1">';
        //场景数
        let sum = this.$store.state.test.sum;
        let imgName = [];
        let hotSpots = [];
        let hotSpotsTarget = [];
        for (let i = 0, len = sum.length; i < len; i++) {
          let node = 'node' + (i + 1);
          //let point = 'Point' + (i + 1);

          imgName.push(sum[i].imgFile.fileName);
          hotSpots.push(sum[i].hotSpots);
          hotSpotsTarget.push(sum[i].target);

          // output +=`<siderbar>`;
          // for (let j = 0; j <sum[i].fileUrlArr.length ; j++) {
          //   output +=`<input fileName="${sum[i].fileUrlArr[j].fileName}" fileUrl="${sum[i].fileUrlArr[j].fileUrl}"/>`;
          //   output += '</input>';
          // }
          // output += '</siderbar>';

          output += `<panorama id="${node}">
                           <input overlap="1" levelingpitch="0" width="1920" levelingroll="0" leveltileurl="tiles/${sum[i].imgFile.fileName.substring(0,sum[i].imgFile.fileName.lastIndexOf('.'))}/cf_%c/l_%l/c_%x/tile_%y.jpg" fileName="${sum[i].fileUrlArr[i].fileName}" fileUrl="${sum[i].fileUrlArr[i].fileUrl}" height="1920" levelbiashidpi="0.400" levelbias="0.400" leveltilesize="510">
                             <level width="1920" preload="0" height="1920" predecode="0"/>
                             <level width="960" preload="0" height="960" predecode="0"/>
                             <level width="480" preload="1" height="480" predecode="1"/>
                             <preview color="0x808080" strip="1"/>
                           </input>
                           <view fovmode="0" pannorth="0">
                             <start fov="70" pan="0" tilt="0"/>
                             <min fov="5" pan="0" tilt="-90"/>
                             <max fov="120" pan="360" tilt="90"/>
                           </view>
                           <userdata author="" info="" latitude="" comment="" copyright="" title="" tags="" longitude="" source="" description="" datetime=""/>
                           <hotspots width="180" wordwrap="1" height="20">
                             <label background="1" borderalpha="1" width="180" bordercolor="0x000000" wordwrap="1" enabled="1" height="20" borderradius="1" textcolor="0x000000" textalpha="1" border="1" backgroundalpha="1" backgroundcolor="0xffffff"/>
                             <polystyle borderalpha="1" handcursor="1" mode="1" bordercolor="0x0000ff" backgroundalpha="0.2509803921568627" backgroundcolor="0x0000ff"/>`;
          for (let j = 0; j < sum[i].jumpHotSpots.length; j++) {
            output += `<hotspot skinid="ht_node" id="${'Point'+(j+1)}" url="{${sum[i].jumpHotSpots[j].hotTarget.replace(/场景/, 'node')}}" pan="${sum[i].jumpHotSpots[j].panAndTilt[0]}" target="0/0/0" tilt="${sum[i].jumpHotSpots[j].panAndTilt[1]}" title="{${sum[i].jumpHotSpots[j].hotIntroduction}}" jumpHotSpotsx="${sum[i].jumpHotSpots[j].position[0]}" jumpHotSpotsy="${sum[i].jumpHotSpots[j].position[1]}" jumpHotSpotsz="${sum[i].jumpHotSpots[j].position[2]}" description=""/>`;
          }
          for (let k = 0; k < sum[i].urlHotSpots.length; k++) {
            let id = 'hpimage' + i + k;
            output += `<polyhotspot id="${id}" url="${'http://' + sum[i].urlHotSpots[k].hotUrl}" title="" description="" target="_blank">
                                <vertex pan="${sum[i].urlHotSpots[k].panAndTilt[0][0]}" tilt="${sum[i].urlHotSpots[k].panAndTilt[0][1]}" urlHotSpotsx="${sum[i].urlHotSpots[k].position[0].x}" urlHotSpotsy="${sum[i].urlHotSpots[k].position[0].y}" urlHotSpotsz="${sum[i].urlHotSpots[k].position[0].z}"/>
                                <vertex pan="${sum[i].urlHotSpots[k].panAndTilt[1][0]}" tilt="${sum[i].urlHotSpots[k].panAndTilt[1][1]}" urlHotSpotsx="${sum[i].urlHotSpots[k].position[1].x}" urlHotSpotsy="${sum[i].urlHotSpots[k].position[1].y}" urlHotSpotsz="${sum[i].urlHotSpots[k].position[1].z}"/>
                                <vertex pan="${sum[i].urlHotSpots[k].panAndTilt[2][0]}" tilt="${sum[i].urlHotSpots[k].panAndTilt[2][1]}" urlHotSpotsx="${sum[i].urlHotSpots[k].position[2].x}" urlHotSpotsy="${sum[i].urlHotSpots[k].position[2].y}" urlHotSpotsz="${sum[i].urlHotSpots[k].position[2].z}"/>
                                <vertex pan="${sum[i].urlHotSpots[k].panAndTilt[3][0]}" tilt="${sum[i].urlHotSpots[k].panAndTilt[3][1]}" urlHotSpotsx="${sum[i].urlHotSpots[k].position[3].x}" urlHotSpotsy="${sum[i].urlHotSpots[k].position[3].y}" urlHotSpotsz="${sum[i].urlHotSpots[k].position[3].z}"/>
                               </polyhotspot>`

          }
          for (let k = 0; k < sum[i].imageHotSpots.length; k++) {
            output += `<polyhotspot id="hpimage" url="" title="" description="" target="${'images/' + sum[i].imageHotSpots[k].hotImage}">
                                <vertex pan="${sum[i].imageHotSpots[k].panAndTilt[0][0]}" tilt="${sum[i].imageHotSpots[k].panAndTilt[0][1]}" imageHotSpotsx="${sum[i].imageHotSpots[k].position[0].x}" imageHotSpotsy="${sum[i].imageHotSpots[k].position[0].y}" imageHotSpotsz="${sum[i].imageHotSpots[k].position[0].z}"/>
                                <vertex pan="${sum[i].imageHotSpots[k].panAndTilt[1][0]}" tilt="${sum[i].imageHotSpots[k].panAndTilt[1][1]}" imageHotSpotsx="${sum[i].imageHotSpots[k].position[1].x}" imageHotSpotsy="${sum[i].imageHotSpots[k].position[1].y}" imageHotSpotsz="${sum[i].imageHotSpots[k].position[1].z}"/>
                                <vertex pan="${sum[i].imageHotSpots[k].panAndTilt[2][0]}" tilt="${sum[i].imageHotSpots[k].panAndTilt[2][1]}" imageHotSpotsx="${sum[i].imageHotSpots[k].position[2].x}" imageHotSpotsy="${sum[i].imageHotSpots[k].position[2].y}" imageHotSpotsz="${sum[i].imageHotSpots[k].position[2].z}"/>
                                <vertex pan="${sum[i].imageHotSpots[k].panAndTilt[3][0]}" tilt="${sum[i].imageHotSpots[k].panAndTilt[3][1]}" imageHotSpotsx="${sum[i].imageHotSpots[k].position[3].x}" imageHotSpotsy="${sum[i].imageHotSpots[k].position[3].y}" imageHotSpotsz="${sum[i].imageHotSpots[k].position[3].z}"/>
                               </polyhotspot>`
          }
          output += `</hotspots>
                           <media/>
                           <transition zoomin="0" zoomoutpause="1" enabled="0" blendcolor="0x000000" zoomspeed="2" type="crossdissolve" blendtime="1" softedge="0" zoomout="0" zoomfov="20"/>
                           <control lockedmouse="0" speedwheel="1" dblclickfullscreen="0" hideabout="0" lockedkeyboard="0" invertwheel="0" invertcontrol="1" lockedkeyboardzoom="0" simulatemass="1" sensitivity="8" lockedwheel="0" contextfullscreen="0"/>
                           </panorama>`;
        }
        output += '</tour>';
        console.log(output);



        //下面是传参给后台
        let that = this;
        let arr = [];
        let arr2 = [];
        for (let i = 0, len = that.$store.state.test.fileUrlArr.length; i < len; i++) {
          arr.push(that.$store.state.test.fileUrlArr[i].fileName);
          arr.push(that.$store.state.test.fileUrlArr[i].fileUrl.replace(/http:\/\/172\.28\.211\.16:8010\//, ''));
        }
        let fastdfsURL = arr.join(',');
        for (let j = 0, len = that.$store.state.test.tietu.length; j < len; j++) {
          arr2.push(that.$store.state.test.tietu[j].fileName);
          arr2.push(that.$store.state.test.tietu[j].fileUrl);
        }
        let hotfastdfsURL = arr2.join(',');
        this.$ajax({
          url: '/web/pano/html',
          method: 'post',
          data: {
            //暂时写死
            _token: that.token,
            user: that.createUserNo,
            xmlstring: output,
            fastdfsURL: fastdfsURL,
            hotfastdfsURL: hotfastdfsURL,
            id: that.$store.state.test.viewNo,
          },
          transformRequest: [function (data) {
            // Do whatever you want to transform the data
            let ret = ''
            for (let it in data) {
              ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
          }],
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        }).then(function (response) {
          console.log(response);

        }).catch(function (error) {
          console.log(error);
        });

        this.$store.commit('createXmlString', output);
      },
      // outputPanorama(){
      //   //对xml进行修改,有问题
      //     let xmlDoc=this.loadXMLDoc("/static/pano.xml");
      //     let newel=xmlDoc.createElement("hotspot");
      //     let newtext=xmlDoc.createTextNode("first");
      //     newel.appendChild(newtext);
      //     let x=xmlDoc.getElementsByTagName("hotspots")[0];
      //     x.appendChild(newel);
      //     let oSerializer = new XMLSerializer();
      //     let sXML = oSerializer.serializeToString(xmlDoc);
      //
      //     let urlObject = window.URL || window.webkitURL || window;
      //     let export_blob = new Blob([sXML]);
      //     let save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
      //     save_link.href = urlObject.createObjectURL(export_blob);
      //     save_link.download = name;
      //     this.fake_click(save_link);
      //
      //     var xmlhttp = new window.XMLHttpRequest();
      //     xmlhttp.open("POST", "/static/pano.xml", false); // open() 方法需要三个参数。第一个参数定义发送请求所使用的方法（GET 还是 POST）。第二个参数规定服务器端脚本的 URL。第三个参数规定应当对请求进行异步地处理。
      //     xmlhttp.send(xmlDoc);
      // },
      loadXMLDoc(dname) {
        let xhttp = null;
        if (window.XMLHttpRequest) {
          xhttp = new XMLHttpRequest();
        }
        else {
          xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.open("GET", dname, false);
        xhttp.send();
        return xhttp.responseText;
      }
      // fake_click(obj) {
      //     var ev = document.createEvent("MouseEvents");
      //     ev.initMouseEvent(
      //         "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
      //     );
      //     obj.dispatchEvent(ev);
      // }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .navbar {
    height: 50px;
    line-height: 50px;
    border-radius: 0px !important;
  }
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }

  .errLog-container {
    display: inline-block;
    position: absolute;
    right: 150px;
  }

  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;
  }
  .avatar-wrapper {
    cursor: pointer;
    margin-top: 5px;
    position: relative;
  }
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .el-icon-caret-bottom {
    position: absolute;
    right: -20px;
    top: 25px;
    font-size: 12px;
  }

</style>



