import Vue from 'vue';
import App from './App.vue';
import DataStore from './store';
import vuetify from './plugins/vuetify';
import locStr from './plugins/locStr';

Vue.config.productionTip = false;
export const bus = new Vue();
export const dataStore = new DataStore();
Vue.use(locStr);

new Vue({
    vuetify,
    render: h => h(App),
}).$mount('#app');
