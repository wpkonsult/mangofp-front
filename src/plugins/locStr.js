/*globals MANGOFP_RESOURCES:false */
const locStr = {
    install(Vue) {
        Vue.prototype.$locStr = function(key) {
            if (
                !MANGOFP_RESOURCES ||
                !MANGOFP_RESOURCES.strings ||
                !MANGOFP_RESOURCES.strings[key]
            ) {
                return key;
            }
            return MANGOFP_RESOURCES.strings[key];
        };
    },
};

export default locStr;
