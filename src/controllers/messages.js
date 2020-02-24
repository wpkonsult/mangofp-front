/*globals RESOURCES:false */
import axios from 'axios';

const ROOT_URL = RESOURCES['adminUrl'];

async function __makeGetRequest(endpoint) {
    const res = await axios.get(ROOT_URL + endpoint);
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

//async function __makePostRequest(endpoint, payload) {
//    const res = await axios.post(ROOT_URL + endpoint, payload);
//    if (!res || res.status !== 200) {
//        throw new Error('Unable to post data to ' + endpoint);
//    }
//
//    return res.data;
//}

async function __makePostRequest(endpoint, payload) {
    const res = await axios.post(ROOT_URL + endpoint, payload);
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

async function fetchLabels() {
    const data = await __makeGetRequest('/labels');

    if (!('labels' in data) || !Array.isArray(data.labels)) {
        throw new Error('No labels found in response');
    }

    const labels = [];
    data.labels.forEach(element => {
        labels.push({ id: element.id, name: element.name });
    });

    return labels;
}

function __makeMessage(element) {
    const states = getStates();
    return {
        id: element.id,
        form: element.form,
        labelId: element.labelId,
        code: element.code,
        state: element.code in states ? states[element.code].state : '??',
        email: element.email,
        name: element.name,
        content: Object.entries(JSON.parse(element.content)),
    };
}

async function fetchMessages() {
    const data = await __makeGetRequest('/messages');

    if (!('messages' in data) || !Array.isArray(data.messages)) {
        throw new Error('No messages found in response');
    }

    const messages = [];
    data.messages.forEach(element => {
        messages.push(__makeMessage(element));
    });

    return messages;
}

async function updateMessage(payload, bus) {
    const data = {
        id: payload.message.id,
        message: {
            id: payload.message.id,
            code: payload.message.code,
        },
        email: false,
    };
    if ('emailContent' in payload.message && 'addresses' in payload.message) {
        data.email = {
            content: payload.message.emailContent,
            addresses: payload.message.addresses,
            subject: payload.message.emailSubject || '',
        };
    }

    const result = await __makePostRequest('/messages/' + data.id, data).catch(
        error => {
            bus.$emit('ErrorConnection', {
                error: error.message || 'Unidentified connection error',
            });
        },
    );

    if (result) {
        bus.$emit('DataMessageUpdated', __makeMessage(result.message));
    }
}

function getStates() {
    return {
        NEW: {
            order: 1,
            code: 'NEW',
            state: 'Uus',
            action: 'Määra uueks',
            next: [
                'REGISTERED',
                'WAIT4CONF',
                'WAIT4NEW',
                'WAIT4ACCEPT',
                'CANCELLED',
                'ARCHIVED',
            ],
        },
        REGISTERED: {
            order: 2,
            code: 'REGISTERED',
            state: 'Registreeritud',
            action: 'Registreeri',
            next: ['NOTIFIED', 'ARCHIVED', 'CANCELLED'],
        },
        WAIT4CONF: {
            order: 3,
            code: 'WAIT4CONF',
            state: 'Kinnitamisel',
            action: 'Saada kinnitamiseks',
            next: ['REGISTERED', 'CANCELLED'],
        },
        WAIT4NEW: {
            order: 4,
            code: 'WAIT4NEW',
            state: 'Vajab uut aega',
            action: 'Ootab uut aega',
            next: ['REGISTERED', 'WAIT4ACCEPT', 'CANCELLED'],
        },
        WAIT4ACCEPT: {
            order: 5,
            code: 'WAIT4ACCEPT',
            state: 'Aeg pakutud',
            action: 'Paku uus aeg',
            next: ['REGISTERED', 'WAIT4ACCEPT', 'CANCELLED'],
        },
        NOTIFIED: {
            order: 6,
            code: 'NOTIFIED',
            state: 'Teade saadetud',
            action: 'Saada meeldetuletus',
            next: ['FBASKED', 'ARCHIVED'],
        },
        FBASKED: {
            order: 7,
            code: 'FBASKED',
            state: 'Tagasiside küsitud',
            action: 'Küsi tagasiside',
            next: ['ARCHIVED'],
        },
        ARCHIVED: {
            order: 8,
            code: 'ARCHIVED',
            state: 'Arhiveeritud',
            action: 'Arhiveeri',
            next: [],
        },
        CANCELLED: {
            order: 9,
            code: 'CANCELLED',
            state: 'Katkestatud',
            action: 'Katkesta',
            next: ['ARCHIVED'],
        },
    };
}

export { fetchLabels, fetchMessages, updateMessage, getStates };
