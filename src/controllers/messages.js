import { dataStore } from '../main';
import { makeGetRequest, makePostRequest } from './common';

async function fetchLabels() {
    const data = await makeGetRequest('/labels');

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
    try {
        const states = dataStore.getSteps();
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
    } catch (e) {
        return false;
    }
}

async function fetchMessagesData() {
    const data = await makeGetRequest('/messages');

    if (!('messages' in data) || !Array.isArray(data.messages)) {
        throw new Error('No messages found in response');
    }

    return data.messages;
}

function setMessages(messagesData) {
    const messages = [];
    messagesData.forEach(element => {
        const createdMessage = __makeMessage(element);
        if (createdMessage) {
            messages.push(createdMessage);
        }
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

    const result = await makePostRequest(
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
            name: payload.message.name,
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

    const result = await makePostRequest('/messages/' + data.id, data).catch(
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

    const result = await makeGetRequest('/messages/' + id).catch(error => {
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
            next: ['CONFRECEIVED', 'CANCELLED'],
        },
        CONFRECEIVED: {
            order: 4,
            code: 'CONFRECEIVED',
            state: 'TTA kinnitanud',
            action: 'TTA kinnitanud',
            next: ['REGISTERED', 'NOTIFIED', 'CANCELLED'],
        },
        WAIT4NEW: {
            order: 5,
            code: 'WAIT4NEW',
            state: 'Ooteleht',
            action: 'Ooteleht',
            next: ['REGISTERED', 'WAIT4ACCEPT', 'CANCELLED'],
        },
        WAIT4ACCEPT: {
            order: 6,
            code: 'WAIT4ACCEPT',
            state: 'Aeg pakutud',
            action: 'Paku uus aeg',
            next: ['REGISTERED', 'WAIT4ACCEPT', 'CANCELLED'],
        },
        NOTIFIED: {
            order: 7,
            code: 'NOTIFIED',
            state: 'Teade saadetud',
            action: 'Saada meeldetuletus',
            next: ['FBASKED', 'ARCHIVED'],
        },
        FBASKED: {
            order: 8,
            code: 'FBASKED',
            state: 'Tagasiside küsitud',
            action: 'Küsi tagasiside',
            next: ['ARCHIVED'],
        },
        NEWSLETTER: {
            order: 9,
            code: 'NEWSLETTER',
            state: 'Uudiskiri',
            action: 'Uudiskiri',
            next: ['ARCHIVED'],
        },
        ARCHIVED: {
            order: 10,
            code: 'ARCHIVED',
            state: 'Arhiveeritud',
            action: 'Arhiveeri',
            next: [],
        },
        CANCELLED: {
            order: 11,
            code: 'CANCELLED',
            state: 'Katkestatud',
            action: 'Katkesta',
            next: ['ARCHIVED'],
        },
    };
}

async function fetchStepsDataToStore() {
    const stepsData = await makeGetRequest('/steps');
    if (!('steps' in stepsData)) {
        throw new Error('No steps found in response');
    }

    dataStore.resetSteps();
    for (const [key, step] of Object.entries(stepsData.steps)) {
        dataStore.setStep(key, step);
    }

    return true;
}

export {
    fetchLabels,
    fetchMessagesData,
    setMessages,
    updateMessage,
    getStates,
    fetchStepsDataToStore,
    getMessage,
    sendEmail,
};
