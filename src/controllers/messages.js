/*globals MANGOFP_RESOURCES:false */
import axios from 'axios';

const ROOT_URL = MANGOFP_RESOURCES['adminUrl'];

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
    const data = {
        id: element.id,
        form: element.form,
        labelId: element.labelId,
        code: element.code,
        state: element.code in states ? states[element.code].state : '??',
        email: element.email,
        name: element.name,
        note: element.note,
        lastUpdated: element.lastUpdated,
        content: Object.entries(JSON.parse(element.content)),
    };

    if ('changeHistory' in element) {
        data.changeHistory = element.changeHistory;
    }

    return data;
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

async function sendEmail(payload, bus) {
    const data = {
        id: payload.message.id,
        message: {
            id: payload.message.id,
        },
        email: {
            content: payload.message.emailContent,
            addresses: payload.message.addresses,
            subject: payload.message.emailSubject || '',
            attachments: payload.message.emailAttachments,
        },
    };

    const result = await __makePostRequest(
        '/messages/' + data.id + '/emails',
        data,
    ).catch(error => {
        bus.$emit('ErrorConnection', {
            error: error.message || 'Unidentified connection error',
        });
    });

    if (result) {
        bus.$emit('DataMessageUpdated', __makeMessage(result.message));
    }

    return result;
}

async function updateMessage(payload, bus) {
    const data = {
        id: payload.message.id,
        message: {
            id: payload.message.id,
            code: payload.message.code,
            email: payload.message.email,
            labelId: payload.message.labelId,
            note: payload.message.note,
        },
        email: false,
    };
    if ('emailContent' in payload.message && 'addresses' in payload.message) {
        data.email = {
            content: payload.message.emailContent,
            addresses: payload.message.addresses,
            subject: payload.message.emailSubject || '',
            attachments: payload.message.emailAttachments,
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

    return result;
}

async function getMessage(id, bus) {
    if (!id) {
        bus.emit('ErrorConnection', { error: 'no id for get request' });
    }

    const result = await __makeGetRequest('/messages/' + id).catch(error => {
        bus.$emit('ErrorConnection', {
            error: error.message || 'Unidentified connection error',
        });
    });

    if (result) {
        bus.$emit('DataMessageUpdated', __makeMessage(result.message));
    }

    return result;
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
                'NEWSLETTER',
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
            state: 'TTA kaudu',
            action: 'TTA kaudu',
            next: ['REGISTERED', 'CANCELLED'],
        },
        WAIT4NEW: {
            order: 4,
            code: 'WAIT4NEW',
            state: 'Ooteleht',
            action: 'Ooteleht',
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
        NEWSLETTER: {
            order: 8,
            code: 'NEWSLETTER',
            state: 'Uudiskiri',
            action: 'Uudiskiri',
            next: ['ARCHIVED'],
        },
        ARCHIVED: {
            order: 9,
            code: 'ARCHIVED',
            state: 'Arhiveeritud',
            action: 'Arhiveeri',
            next: [],
        },
        CANCELLED: {
            order: 10,
            code: 'CANCELLED',
            state: 'Katkestatud',
            action: 'Katkesta',
            next: ['ARCHIVED'],
        },
    };
}

export {
    fetchLabels,
    fetchMessages,
    updateMessage,
    getStates,
    getMessage,
    sendEmail,
};
