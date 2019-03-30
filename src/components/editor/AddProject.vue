<template>
    <div id="inputbox">
        <h4>新建项目</h4>
        <input v-model="shortName" placeholder="请输入项目名称">
        <div class="queryBox">
            <input id="queryInput" placeholder="输入公司位置打开地图">
            <!--<input type="button" id="startQuery" value="搜索">-->
            <el-button type="primary" plain id="startQuery">搜索</el-button>
            <div class="companyName">
                <input type="button" id="submitSite" value="提交">
            </div>
        </div>
        <div class="mapBox mb1">
            <div id="mapcontainer">

            </div>
        </div>
        <input type="hidden" id="latitude">
        <input type="hidden" id="longitude">
    </div>
</template>

<script>
    export default {
        name: "add-project"
    }
</script>

<style scoped>

</style>