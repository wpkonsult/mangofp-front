/*globals RESOURCES:false */
import axios from 'axios';

const ROOT_URL = RESOURCES['adminUrl'];

async function __makeGetRequest(endpoint) {
    const res = await axios.get(ROOT_URL + endpoint);
    if (!res || res.status !== 200) {
        throw new Error('Unable to read data from ' + endpoint);
    }

    return res.data;
}

//async function __makePostRequest(endpoint, payload) {
//    const res = await axios.post(ROOT_URL + endpoint, payload);
//    if (!res || res.status !== 200) {
//        throw new Error('Unable to post data to ' + endpoint);
//    }
//
//    return res.data;
//}

async function __makePutRequest(endpoint, payload) {
    const res = await axios.put(ROOT_URL + endpoint, payload);
    if (!res || res.status !== 200) {
        throw new Error('Unable to post data to ' + endpoint);
    }

    return res.data;
}

async function fetchLabels() {
    const res = await axios.get(ROOT_URL + '/labels');
    if (!res || res.status !== 200) {
        throw new Error('Unable to read data');
    }

    if (!('labels' in res.data) || !Array.isArray(res.data.labels)) {
        console.log(JSON.stringify(res));
        throw new Error('No labels found in response');
    }

    const labels = [];
    res.data.labels.forEach(element => {
        labels.push({ id: element.id, name: element.name });
    });

    return labels;
}

function __makeMessage(element) {
    return {
        id: element.id,
        form: element.form,
        labelId: element.labelId,
        code: element.code,
        state: element.state,
        email: element.email,
        name: element.name,
        content: Object.entries({
            name: element.content.name,
            message: element.content.message,
        }),
    };
}

async function fetchMessages() {
    const data = await __makeGetRequest('/messages');

    if (!('messages' in data) || !Array.isArray(data.messages)) {
        console.log(JSON.stringify(data));
        throw new Error('No messages found in response');
    }

    const messages = [];
    data.messages.forEach(element => {
        messages.push(__makeMessage(element));
    });

    return messages;
}

async function updateMessage(payload, bus) {
    console.log('Will submit payload: ' + JSON.stringify(payload));
    const id = payload.message.id;
    await __makePutRequest('/messages/' + id, payload).catch(error => {
        bus.$emit('ErrorConnection', {
            error: error.message || 'Unidentified connection error',
        });
    });
}

export { fetchLabels, fetchMessages, updateMessage };
