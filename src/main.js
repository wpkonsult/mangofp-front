import Vue from 'vue';
import App from './App.vue';
import store from './store';
import vuetify from './plugins/vuetify';
import locStr from './plugins/locStr';

Vue.config.productionTip = false;
export const bus = new Vue();

Vue.use(locStr);

new Vue({
    store,
    vuetify,
    render: h => h(App),
}).$mount('#app');
