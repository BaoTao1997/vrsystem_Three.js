import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
// import user from './modules/user';
// import permission from './modules/permission';
// import getters from './getters';
import nav from './modules/nav';
import test from './modules/status';

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        app,
        // user,
        nav,
        // permission,
        test
    },
    // getters,
});

export default store
