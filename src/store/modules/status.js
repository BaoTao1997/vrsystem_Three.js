

const test = {
  state:{
    arr:[],//xml字符串读取的数据信息
    maxID:0,//用于保存相应节点的最大ID
    selectHotType:'',//用于select选择框判断热点类型
    selectUploadPicture:'',//用于select选择框判断已上传图片
    selectJumpScene:'',//用于select选择框判断跳转场景
    inputHotIntroduction:'',//用于input输入框输入的场景说明
    inputHotUrl:'',//用于input输入框输入的热点链接
    newIsDeleteHotSpot:false,//用于热点管理的删除热点
    position:[],//用于保存热点管理点击删除后的热点的位置
    pid:[],//用于判断热点的类型
    activeJumpHotSpot:false,//用于判断跳转热点是否被点击
    inactiveJumpHotSpot:false,//用于把点击之后的热点重新绘制
    activeImageHotSpot:false,//用于判断图像热点是否被点击
    inactiveImageHotSpot:false,//用于把点击之后的图像热点重新绘制
    activeUrlHotSpot:false,//用于判断图像热点是否被点击
    inactiveUrlHotSpot:false,//用于把点击之后的图像热点重新绘制
    activePost:{},//用于保存点击之后的热点
    sceneDelete:{},//用于场景的删除

    //视频热点的相关参数
    //绘制视频热点时中心的三维坐标和二维屏幕坐标
    oldselected:{},//里面的三维坐标值通过换算成xml的pan和tilt参数上传
    //平移参数x
    isVideoTransformX:false,
    valueX:1,//水平平移长度的倍率,默认是1
    //videoTransformX:0,
    //平移参数y
    isVideoTransformY:false,
    valueY:1,//竖直平移长度的倍率,默认是1
    //videoTransformY:0,
    //旋转参数
    isVideoRotate:false,
    valueR:1,//旋转角度的倍率,默认是1度
    videoRotate:0,//作为xml的rotZ参数上传
    //放缩系数
    isVideoScale:false,
    valueS:0.1,//旋转角度的倍率,默认是0.1倍
    videoScale:1,//作为xml的fov参数上传，需要转换关系
    //为了保证鼠标事件不影响绘制的视频热点
    videoGroup:[],//存放四边形四个顶点的三维世界坐标


    imgType: 'Auto',
    isAddProject:true,
    // endAction: '',
    // level: 1,
    // loop: 1,
    // pitch: 1,
    // roll: 1,
    // pan: 1,
    // tilt: 1,
    // fov: 1,
    // min: 1,
    // max: 1,
    // pannorth: 1,
    dateVal: '',
    // external: [],
    // showLimits: true,
    // minFov: ['Degrees'],
    pickerOptions0: {
      disabledDate(time) {
        return time.getTime() < Date.now() - 8.64e7;
      }
    },
    //用这个
    // imgFile:{fileName:'tianyu01.jpg',fileUrl:['/static/textures/tianyu01.jpg'],
    //   tempfileUrl:['/static/textures/tianyucube/right.jpg','/static/textures/tianyucube/left.jpg',
    //     '/static/textures/tianyucube/top.jpg','/static/textures/tianyucube/bottom.jpg',
    //     '/static/textures/tianyucube/front.jpg','/static/textures/tianyucube/back.jpg']},

    // imgFile:{fileName:'tianyu01.jpg',fileUrl:['/static/textures/tianyu01.jpg']},
    imgFile:{fileName:'1_sphere.jpg',fileUrl:['/static/textures/1_sphere.jpg']},

    // imgFile:{fileName:'系统默认图片',fileUrl:['/static/textures/tianyu01.jpg'],
    //     tempfileUrl:['/static/textures/tianyucube/right.jpg','/static/textures/tianyucube/left.jpg',
    //         '/static/textures/tianyucube/top.jpg','/static/textures/tianyucube/bottom.jpg',
    //         '/static/textures/tianyucube/front.jpg','/static/textures/tianyucube/back.jpg']},
    // fileUrlArr:[{'fileName':'tianyu01.jpg','fileUrl':'../../../static/textures/tianyu01.jpg'},
    //   {'fileName':'tianyu02.jpg','fileUrl':'../../../static/textures/tianyu02.jpg'},
    //   {'fileName':'tianyu03.jpg','fileUrl':'../../../static/textures/tianyu03.jpg'},
    //   {'fileName':'tianyu04.jpg','fileUrl':'../../../static/textures/tianyu04.jpg'},
    //   {'fileName':'tianyu10.jpg','fileUrl':'../../../static/textures/tianyu10.jpg'}],


    //用这个
    // fileUrlArr:[{'fileName':'tianyu01.jpg','fileUrl':'/static/textures/tianyu01.jpg'},
    //   {'fileName':'tianyu02.jpg','fileUrl':'/static/textures/tianyu02.jpg'},
    //   {'fileName':'tianyu03.jpg','fileUrl':'/static/textures/tianyu03.jpg'},
    //   {'fileName':'tianyu04.jpg','fileUrl':'/static/textures/tianyu04.jpg'},
    //   {'fileName':'tianyu10.jpg','fileUrl':'/static/textures/tianyu10.jpg'}],

    fileUrlArr:[],


    isHotspot:false,
    isImageHotspot:false,
    isVideoHotspot:false,
    isSubmit:false,
    hotSpots:[],
    imgHotSpots:{},
    // target:[],
    // hotUrl:[],
    //hotIntroduction:[],
    sum:[],
    isJumpHotSpot:false,
    isVideoHotSpot:false,
    //isUrlHotSpot:false,
    isImgHotSpot:false,
    hotSpotsImgs:[{'key':'tianyu01.jpg','value':'tianyu01.jpg'},{'key':'tianyu02.jpg','value':'tianyu02.jpg'}],
    //hotSpotsImgs:[],
    tempLocation:{},
    isDeleteHotSpot:false,
    jumpHotSpots:[],
    urlHotSpots:[],
    imageHotSpots:[],
    // activeName:'scene',
    viewNo:'',
    panoUploadUrl:'',
    tietu:[],
    output:'<?xml version="1.0" encoding="UTF-8"?>'
  },
  mutations: {
    //把字符串读取的数据信息存到state的arr中
    addArr:(state,msg2)=>{
      state.arr=msg2;
    },
    saveimgType:(state,msg2)=>{
      state.imgType=msg2;
      //console.log('imgType: '+state.imgType);
    },
    // saveendAction:(state,msg2)=>{
    //     state.endAction=msg2;
    //    // console.log('endAction: '+state.endAction);
    // },
    // savelevel:(state,msg2)=>{
    //     state.level=msg2;
    //     //console.log('level: '+state.level);
    // },
    // saveloop:(state,msg2)=>{
    //     state.loop=msg2;
    //     //console.log('loop: '+state.loop);
    // },
    // savepitch:(state,msg2)=>{
    //     state.pitch=msg2;
    //     //console.log('pitch: '+state.pitch);
    // },
    // saveroll:(state,msg2)=>{
    //     state.roll=msg2;
    //     //console.log('roll: '+state.roll);
    // },
    // savepan:(state,msg2)=>{
    //     state.pan=msg2;
    //    // console.log('pan: '+state.pan);
    // },
    // savetilt:(state,msg2)=>{
    //     state.tilt=msg2;
    //   //  console.log('tilt: '+state.tilt);
    // },
    // savefov:(state,msg2)=>{
    //     state.fov=msg2;
    //     //console.log('fov: '+state.fov);
    // },
    // savemin:(state,msg2)=>{
    //     state.min=msg2;
    //     //console.log('min: '+state.min);
    // },
    // savemax:(state,msg2)=>{
    //     state.max=msg2;
    //    // console.log('max: '+state.max);
    // },
    // savepannorth:(state,msg2)=>{
    //     state.pannorth=msg2;
    //     //console.log('pannorth: '+state.pannorth);
    // },
    // saveexternal:(state,msg2)=>{
    //     state.external=msg2;
    //     //console.log('external: '+state.external);
    // },
    // saveminFov:(state,msg2)=>{
    //     state.minFov=msg2;
    //    // console.log('minFov: '+state.minFov);
    // },
    // saveshowLimits:(state,msg2)=>{
    //     state.showLimits=msg2;
    //     //console.log('showLimits: '+state.showLimits);
    // },
    saveimgFile:(state,msg2)=>{
      state.imgFile=msg2;
      //console.log('imgFileName: '+state.imgFile.fileName+'imgFileUrl: '+state.imgFile.fileUrl);
    },
    saveFileUrlArr:(state,msg2)=>{
      // state.fileUrlArr.push(msg2);
      state.fileUrlArr=msg2;
    },
    saveHotSpotsImgs:(state,msg2)=>{
      state.hotSpotsImgs=msg2;
    },
    saveTietu:(state,msg2)=>{
      state.tietu=msg2;
    },
    isHotspot:(state)=>{
      state.isHotspot=!state.isHotspot;
      //state.activeName='hotSpot';
    },
    isImageHotspot:(state)=>{
      state.isImageHotspot=!state.isImageHotspot;
      //state.activeName='hotSpot';
    },
    isVideoHotspot:(state)=>{
      state.isVideoHotspot=!state.isVideoHotspot;
      //state.activeName='hotSpot';
    },
    isSubmit:(state)=>{
      state.isSubmit=!state.isSubmit;
    },
    //场景中所有的跳转热点存储
    hotSpots:(state,msg2)=>{
      state.hotSpots=msg2.sprites;
    },
    //场景中所有的图片热点存储
    imgHotSpots:(state,msg2)=>{
      state.imgHotSpots=msg2.imgHotSpots;
    },
    // saveTarget:(state,msg2)=>{
    //     state.target.push(msg2);
    // },
    // saveHotUrl:(state,msg2)=>{
    //     state.hotUrl.push(msg2.hotUrl);
    // },
    // saveHotIntroduction:(state,msg2)=>{
    //   state.hotIntroduction.push(msg2.hotIntroduction);
    // },
    saveInformation:(state)=>{
      //如果是在同一个场景中保存的话，对sum中的元素对象进行替换，否则是新增
      let hotSpots=state.hotSpots;
      let imgHotSpots=state.imgHotSpots;
      let time=0;
      state.isSubmit=!state.isSubmit;
      let interval=setInterval(function () {
        time+=100;
        if((state.hotSpots!==hotSpots||time==500)&&(state.imgHotSpots!==imgHotSpots||time==500)){
          clearInterval(interval);
          let jumpHotSpots=state.jumpHotSpots;
          let urlHotSpots=state.urlHotSpots;
          let imageHotSpots=state.imageHotSpots;
          let temp=[];
          let temp2=[];
          let temp3=[];
          for(let i=0;i<jumpHotSpots.length;i++){
            for(let j=0;j<state.hotSpots.length;j++){
              if(jumpHotSpots[i].position[0]==state.hotSpots[j].position[0]){
                temp.push(jumpHotSpots[i]);
              }
            }

          }
          for(let i=0;i<urlHotSpots.length;i++){
            for(let j=0;j<state.imgHotSpots.length;j++){
              if(urlHotSpots[i].position[0]==state.imgHotSpots[j].position[0]){
                temp2.push(urlHotSpots[i]);
              }
            }

          }
          for(let i=0;i<imageHotSpots.length;i++){
            for(let j=0;j<state.imgHotSpots.length;j++){
              if(imageHotSpots[i].position[0]==state.imgHotSpots[j].position[0]){
                temp3.push(imageHotSpots[i]);
              }
            }

          }
          state.jumpHotSpots=temp;
          state.urlHotSpots=temp2;
          state.imageHotSpots=temp3;
          let flag=true;
          let keys=Object.keys(state);
          let o={};
          for(let key of keys){
            if(key!='sum'){
              o[key]=state[key];
            }
          }
          for(let i=0;i<state.sum.length;i++){
            if(state.sum[i].imgFile.fileUrl[0]==o.imgFile.fileUrl[0]){
              flag=false;
              state.sum[i]=o;
            }
          }
          if(flag){
            state.sum.push(o);
          }
          //console.log(state.sum);
          //点击保存场景后切换后场景选择界面
          //state.activeName='scene';

        }
      },100);

    },
    // saveStatus:(state,msg2)=>{
    //     state.k=msg2.k;
    //     state.m=msg2.m;
    // }
    clearHotSpots:(state)=>{
      // state.target=[];
      state.hotSpots=[];
      //state.hotUrl=[];
      state.imgHotSpots=[];
      //state.hotIntroduction=[];
      state.jumpHotSpots=[];
      state.urlHotSpots=[];
      state.imageHotSpots=[];
    },
    showJumpHotSpot:(state)=>{
      state.isJumpHotSpot=true;
      state.isImgHotSpot=false;
      state.isVideoHotSpot=false;
      state.selectHotType='';
      state.selectUploadPicture='';
      state.selectJumpScene='';
    },
    showImgHotSpot:(state)=>{
      state.isImgHotSpot=true;
      state.isJumpHotSpot=false;
      state.isVideoHotSpot=false;
      state.selectHotType='';
      state.selectUploadPicture='';
      state.selectJumpScene='';
    },
    showVideoHotSpot:(state)=>{
      state.isVideoHotSpot=true;
      state.isJumpHotSpot=false;
      state.isImgHotSpot=false;
      state.selectHotType='';
      state.selectUploadPicture='';
      state.selectJumpScene='';
    },
    //不显示任何热点参数
    hideHotSpot:(state)=>{
      state.isImgHotSpot=false;
      state.isJumpHotSpot=false;
      state.isVideoHotSpot=false;
    },
    saveTempLocation:(state,msg2)=>{
      state.tempLocation=msg2;
    },
    saveJumpHotSpot:(state,msg2)=>{
      let obj={};
      obj.hotTarget=msg2.hotTarget;
      obj.hotIntroduction=msg2.hotIntroduction;
      obj.position=state.tempLocation.location;
      obj.panAndTilt=state.tempLocation.panAndTilt;
      state.jumpHotSpots.push(obj);
    },
    saveUrlHotSpot:(state,msg2)=>{
      let obj={};
      obj.hotUrl=msg2.hotUrl;
      obj.position=state.tempLocation.location;
      obj.panAndTilt=state.tempLocation.panAndTilt;
      state.urlHotSpots.push(obj);
    },
    saveImageHotSpot:(state,msg2)=>{
      let obj={};
      obj.hotImage=msg2.hotImage;
      obj.position=state.tempLocation.location;
      obj.panAndTilt=state.tempLocation.panAndTilt;
      state.imageHotSpots.push(obj);
    },
    saveViewNo:(state,msg2)=>{
      state.viewNo=msg2.viewNo;
      state.panoUploadUrl='/web/file/'+state.viewNo+'/pano/3';
    },
    deleteHotSpot:(state)=>{
      state.isDeleteHotSpot=true;
    },
    deletedHotSpot:(state)=>{
      state.isDeleteHotSpot=false;
      state.newIsDeleteHotSpot=false;
    },
    //用于热点管理的热点删除(在App.main中删除)
    newDeleteHotSpot:(state,msg2)=>{
      state.newIsDeleteHotSpot=true;
      state.pid=msg2.pid;
      state.position=msg2.position;
    },
    //用于热点管理的树形控件来删除各个类型的热点(在树形结构中删除)
    deleteJumpHotSpot:(state,msg2)=>{
      //state.tree[msg2.scene].children[0].children.splice(msg2.index,1);
      state.arr[msg2.scene].hotspot.splice(msg2.index,1);
      state.maxID=state.maxID-3;
    },
    deleteImageHotSpot:(state,msg2)=>{
      //state.tree[msg2.scene].children[1].children.splice(msg2.index,1);
      state.arr[msg2.scene].polyhotspot.imageHotSpots.splice(msg2.index,1);
      state.maxID=state.maxID-2;
    },
    deleteUrlHotSpot:(state,msg2)=>{
      //state.tree[msg2.scene].children[2].children.splice(msg2.index,1);
      state.arr[msg2.scene].polyhotspot.urlHotSpots.splice(msg2.index,1);
      state.maxID=state.maxID-2;
    },
    //用于热点管理的场景删除
    deleteScene:(state,msg2)=>{
      state.sceneDelete={index:msg2};
      state.arr.splice(msg2,1);
      state.fileUrlArr.splice(msg2,1);
    },
    //生成xml字符串
    createXmlString:(state,msg2)=>{
      state.output=msg2;
    },
    //点击热点管理的热点类型下的热点这一块则把热点信息保存到state中，并绘制新热点删除旧热点
    showActiveJumpSpot:(state,msg2)=>{
      state.activePost=msg2;
      state.activeJumpHotSpot=!state.activeJumpHotSpot;//需要的只是其状态的改变
    },
    showInactiveJumpSpot:(state)=>{
      state.inactiveJumpHotSpot=!state.inactiveJumpHotSpot;
    },
    showActiveImageSpot:(state,msg2)=>{
      state.activePost=msg2;
      state.activeImageHotSpot=!state.activeImageHotSpot;
    },
    showInactiveImageSpot:(state)=>{
      state.inactiveImageHotSpot=!state.inactiveImageHotSpot;
    },
    showActiveUrlSpot:(state,msg2)=>{
      state.activePost=msg2;
      state.activeUrlHotSpot=!state.activeUrlHotSpot;
    },
    showInactiveUrlSpot:(state)=>{
      state.inactiveUrlHotSpot=!state.inactiveUrlHotSpot;
    },
    //把热点信息的树形结构保存到state

    // addArr:(state,msg2)=>{
    //   state.tree=msg2;
    // },
    //保存树状结构节点的最大ID
    addMaxID:(state,msg2)=>{
      state.maxID=msg2;
    },
    //把跳转热点的热点说明传递到state，保证实时更新
    saveTreeHotIntroduction:(state,msg2)=>{
      state.arr[msg2.i].hotspot[msg2.l].title="{"+msg2.result+"}";
    },
    savehotIntroduction:(state,msg2)=>{
      state.jumpHotSpots[msg2.k].hotIntroduction=msg2.result;
    },
    //把Url热点的热点链接传递到state，保证实时更新
    saveTreeHotUrl:(state,msg2)=>{
      state.arr[msg2.i].polyhotspot.urlHotSpots[msg2.l].url="http://"+msg2.result;
    },
    savehotUrl:(state,msg2)=>{
      state.urlHotSpots[msg2.k].hotUrl=msg2.result;
    },
    //把跳转热点的跳转场景传递到state，保证实时更新
    saveTreeJumpScene:(state,msg2)=>{
      state.arr[msg2.i].hotspot[msg2.l].url="{"+msg2.result.replace("场景",'node')+"}";
    },
    savehotTarget:(state,msg2)=>{
      state.jumpHotSpots[msg2.k].hotTarget=msg2.result;
    },
    //把图像热点的已上传图片信息传递到state，保证实时更新
    saveTreeUploadPicture:(state,msg2)=>{
      state.arr[msg2.i].polyhotspot.imageHotSpots[msg2.l].target='images/'+msg2.result;
    },
    savehotImage:(state,msg2)=>{
      state.imageHotSpots[msg2.k].hotImage=msg2.result;
    },
    //把更改的热点信息保存到state中
    changeJumpHotSpot:(state,msg2)=>{
      state.jumpHotSpots[msg2.index].hotIntroduction=msg2.hotIntroduction;
      state.jumpHotSpots[msg2.index].hotTarget=msg2.hotTarget;
    },
    changeImageHotSpot:(state,msg2)=>{
      state.imageHotSpots[msg2.index].hotImage=msg2.hotImage;
    },
    changeUrlHotSpot:(state,msg2)=>{
      state.urlHotSpots[msg2.index].hotUrl=msg2.hotUrl;
    },
    //把更改的热点信息保存到state的tree中
    changeTreeJumpHotSpot:(state,msg2)=>{
      state.arr[msg2.scene].hotspot[msg2.index].title="{"+msg2.hotIntroduction+"}";
      state.arr[msg2.scene].hotspot[msg2.index].url="{"+msg2.hotTarget.replace("场景",'node')+"}";
    },
    changeTreeUrlHotSpot:(state,msg2)=>{
      state.arr[msg2.scene].polyhotspot.urlHotSpots[msg2.index].url="http://"+msg2.hotUrl;
    },
    changeTreeImageHotSpot:(state,msg2)=>{
      state.arr[msg2.scene].polyhotspot.imageHotSpots[msg2.index].target='images/'+msg2.hotImage;
    },
    //把新增的热点信息保存到state的tree中
    saveTreeJumpHotSpot:(state,msg2)=>{
      let newobj={};
      newobj.id="Point"+(state.jumpHotSpots.length+1);
      newobj.position=state.tempLocation.location;
      newobj.panAndTilt=state.tempLocation.panAndTilt;
      newobj.title="{"+msg2.hotIntroduction+"}";
      newobj.url="{"+msg2.hotTarget.replace("场景",'node')+"}";
      state.arr[msg2.scene].hotspot.push(newobj);
    },
    saveTreeUrlHotSpot:(state,msg2)=>{
      let newobj={};
      newobj.id='hpimage' + msg2.scene + state.urlHotSpots.length;
      newobj.position=state.tempLocation.location;
      newobj.panAndTilt=state.tempLocation.panAndTilt;
      newobj.url="http://"+msg2.hotUrl;
      state.arr[msg2.scene].polyhotspot.urlHotSpots.push(newobj);
    },
    saveTreeImageHotSpot:(state,msg2)=>{
      let newobj={};
      newobj.id='hpimage';
      newobj.position=state.tempLocation.location;
      newobj.panAndTilt=state.tempLocation.panAndTilt;
      newobj.target='images/'+msg2.hotImage;
      state.arr[msg2.scene].polyhotspot.imageHotSpots.push(newobj);
    },
    //selectHotType代表select选择框中的热点类型
    saveSelectHotType:(state,msg2)=>{
      state.selectHotType=msg2;
    },
    //selectUploadPicture代表select选择的已上传图片
    saveSelectUploadPicture:(state,msg2)=>{
      state.selectUploadPicture=msg2;
    },
    //selectJumpScene代表select选择的跳转场景
    saveSelectJumpScene:(state,msg2)=>{
      state.selectJumpScene=msg2;
    },
    //inputHotIntroduction用于input输入框输入的场景说明
    saveInputHotIntroduction:(state,msg2)=>{
      state.inputHotIntroduction=msg2;
    },
    //inputHotUrl用于input输入框输入的热点链接
    saveInputHotUrl:(state,msg2)=>{
      state.inputHotUrl=msg2;
    },





    //视频热点的相关操作

    //保存绘制时视频热点的坐标信息
    saveOldSelected:(state,msg2)=>{
      state.oldselected=msg2;
    },
    changeOldSelectedX:(state,msg2)=>{
      // state.oldselected.client[0]=parseInt(msg2);
      state.valueX = parseInt(msg2);
      state.isVideoTransformX=!state.isVideoTransformX;
    },
    changeOldSelectedY:(state,msg2)=>{
      // state.oldselected.client[1]=parseInt(msg2);
      state.valueY = parseInt(msg2);
      state.isVideoTransformY=!state.isVideoTransformY;
    },
    changeOldSelectedR:(state,msg2)=>{
      //state.videoRotate=parseInt(msg2);
      state.valueR = parseInt(msg2);
      state.videoRotate += parseInt(msg2);
      state.isVideoRotate=!state.isVideoRotate;
    },
    changeOldSelectedS:(state,msg2)=>{
      state.valueS = parseInt(msg2);
      state.videoScale += parseFloat(msg2);
      state.videoScale = Math.round(state.videoScale*10)/10;//保留小数点后一位
      state.isVideoScale=!state.isVideoScale;
    },
    saveVideoGroup:(state,msg2)=>{
      state.videoGroup.push(msg2);
    },
    emptyVideoGroup:(state)=>{
      state.videoGroup=[];
    },
    // saveOldselectedClient:(state,msg2)=>{
    //   state.oldselected.client[0] = msg2.x;
    //   state.oldselected.client[1] = msg2.y;
    // },
    saveOldselectedVector:(state,msg2)=>{
      state.oldselected.vector = msg2;
    },
    saveOldselectedSelect:(state,msg2)=>{
      state.oldselected.select[0] = msg2[0];
      state.oldselected.select[1] = msg2[1];
      state.oldselected.select[2] = msg2[2];
    },
    //倍率关系更新
    updateValueX:(state,msg2)=>{
      state.valueX = msg2;
    },
    updateValueY:(state,msg2)=>{
      state.valueY = msg2;
    },
    updateValueR:(state,msg2)=>{
      state.valueR = msg2;
    },
    updateValueS:(state,msg2)=>{
      state.valueS = msg2;
    },


  }

  ,
  actions: {
    saveimgFile:({commit},msg)=>{
      commit('saveimgFile',msg)
    },
    saveInformation:({commit})=>{
      commit('saveInformation')
    },
    isHotspot:({commit})=>{
      commit('isHotspot')
    },
    isSubmit:({commit})=>{
      commit('isSubmit')
    },
    isImageHotspot:({commit})=>{
      commit('isImageHotspot')
    },
    isVideoHotspot:({commit})=>{
      commit('isVideoHotspot')
    },
    hotSpots:({commit},msg)=>{
      commit('hotSpots',msg)
    },
    imgHotSpots:({commit},msg)=>{
      commit('imgHotSpots',msg)
    }
  }
};

export default test;
