/*globals MANGOFP_RESOURCES:false */
import axios from 'axios';

const ROOT_URL = MANGOFP_RESOURCES['adminUrl'];
const nonce = MANGOFP_RESOURCES['nonce'];

async function makeGetRequest(endpoint) {
    const config = {
        headers: {
            'X-WP-Nonce': nonce,
        },
    };
    console.log(config);
    const res = await axios.get(ROOT_URL + endpoint, config);
    if (!res || res.status !== 200) {
        throw new Error('Unable to read data from ' + endpoint);
    }

    if (
        !('status' in res.data) ||
        res.data.status !== 'RESULT_SUCCESS' ||
        !('payload' in res.data)
    ) {
        throw new Error('Could not read response status');
    }

    return res.data.payload;
}

async function makePostRequest(endpoint, payload) {
    const config = {
        headers: {
            'X-WP-Nonce': nonce,
        },
    };
    const res = await axios.post(ROOT_URL + endpoint, payload, config);
    if (!res || res.status !== 200) {
        throw new Error('Error received from request. Details: ' + endpoint);
    }

    if (
        !('status' in res.data) ||
        res.data.status !== 'RESULT_SUCCESS' ||
        !('payload' in res.data)
    ) {
        throw new Error('Could not read response status');
    }

    return res.data.payload;
}

export { makeGetRequest, makePostRequest };
