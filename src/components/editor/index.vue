<template>
  <div class="app-container">
      <equirectangular v-if="isEquirectangular"></equirectangular>  <!--矩形球面-->
      <cube-faces v-if="isCubeFaces"></cube-faces>   <!--立方面片-->
      <cylindrical v-if="isCylindrical"></cylindrical>  <!--圆柱型-->
      <flat v-if="isFlat"></flat>  <!--平板图-->
      <!--<add-project v-if="isAddProject"></add-project>-->

  </div>
</template>
<script>
    import Equirectangular from "./Equirectangular";
    import CubeFaces from "./CubeFaces";
    import Cylindrical from "./Cylindrical";
    import Flat from "./Flat";
    import AddProject from "./AddProject";

    export default {
        components: {
            Flat,
            Cylindrical,
            CubeFaces,
            Equirectangular,
            AddProject,
        },
        name: "index",
        mounted(){
            // 从url中获取项目id
            let viewNo=this.$route.query.viewNo;
            this.$store.commit('saveViewNo',{viewNo:viewNo});
            console.log(viewNo);
        },
        computed:{
            isEquirectangular(){
                if(this.$store.state.test.imgType=='Auto'||this.$store.state.test.imgType=='Equirectangular'){
                    return true;
                }else{
                    return false;
                }
            },
            isCubeFaces(){
                if(this.$store.state.test.imgType=='Cube Faces'){
                    return true;
                }else{
                    return false;
                }
            },
            isCylindrical(){
                if(this.$store.state.test.imgType=='Cylindrical'){
                    return true;
                }else{
                    return false;
                }
            },
            isFlat(){
                if(this.$store.state.test.imgType=='Flat'){
                    return true;
                }else{
                    return false;
                }
            },
            isAddProject(){
                return this.$store.state.test.isAddProject;
            }
        }
    }

</script>
