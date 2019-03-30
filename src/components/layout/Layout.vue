<template>
    <div class="app-wrapper" :class="{hideSidebar:!sidebar.opened}">
        <div class="sidebar-wrapper">
            <Sidebar class="sidebar-container"/>
        </div>
        <!--<div class="navbar-container"><Navbar/></div>-->
        <div class="main-container">
            <Navbar/>
            <App-main/>
        </div>
    </div>
</template>

<script>
    // import { Navbar, Sidebar, AppMain } from 'views/layout';
    import Navbar from './Navbar';
    import Sidebar from './Sidebar';
    import AppMain from './AppMain.vue';


    export default {
      name: 'layout',
      components: {
        Navbar,
        Sidebar,
        AppMain
      },
      computed: {
        sidebar() {
           return this.$store.state.app.sidebar;
        }
      }
    }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
    @import "src/styles/mixin.scss";

    .app-wrapper {
        @include clearfix;
        position: relative;
        height: 100%;
        width: 100%;
        &.hideSidebar {
            .sidebar-wrapper {
                transform: translate(-260px, 0);
                .sidebar-container {
                    transform: translate(258px, 0);
                }
                &:hover {
                    transform: translate(0, 0);
                    .sidebar-container {
                        transform: translate(0, 0);
                    }
                }
            }
            .main-container{
                margin-left: 40px;
            }
        }
        .sidebar-wrapper {
            width: 300px;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 1001;
            overflow-x: hidden;
            transition: all .28s ease-out;
            @include scrollBar;
        }
        .sidebar-container {
            transition: all .28s ease-out;
        }
        .main-container {
            position: fixed;
            min-height: 100%;
            transition: all .28s ease-out;
            margin-left: 300px;
        }
        /*.navbar-container {*/
           /*min-height: 100%;*/
           /*transition: all .28s ease-out;*/
           /*margin-left: 0px;*/
         /*}*/
    }
</style>
