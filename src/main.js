import Vue from 'vue';
import App from './App.vue';
import DataStore from './store';
import vuetify from './plugins/vuetify';
import locStr from './plugins/locStr';

Vue.config.productionTip = false;
export const bus = new Vue();
export const dataStore = new DataStore();
Vue.use(locStr); //add this to your main.js file

new Vue({
    vuetify,
    render: h => h(App),
}).$mount('#app');
