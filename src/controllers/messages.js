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
            isUnread: element.isUnread,
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

    function compareByLastUpdated(a, b) {
        const aLastUpdated = a.lastUpdated;
        const bLastUpdated = b.lastUpdated;
        if (aLastUpdated < bLastUpdated) {
            return 1;
        }
        if (aLastUpdated > bLastUpdated) {
            return -1;
        }
        return 0;
    }

    return data.messages.sort(compareByLastUpdated);
}

function addMessages(messagesData) {
    messagesData.forEach(element => {
        const createdMessage = __makeMessage(element);
        if (createdMessage) {
            dataStore.addMessage(createdMessage);
        }
    });
    return true;
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
            ccAddresses: payload.message.ccAddresses,
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
            ccAddresses: payload.message.ccAddresses || [],
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

async function fetchTemplates() {
    const templatesData = await makeGetRequest('/templates');
    if (templatesData && 'templates' in templatesData) {
        for (const code in templatesData.templates) {
            const data = templatesData.templates[code];
            if (data && 'template' in data) {
                dataStore.setTemplate(code, {
                    addresses: data.mainAddresses,
                    ccAddresses: data.addresses,
                    template: data.template,
                });
            }
        }
    }
    dataStore.setTemplatesLoaded(true);
    return true;
}

async function markHistoryItemUnread(historyItem) {
    const data = {
        isUnread: historyItem.isUnread,
    };

    const result = await makePostRequest(
        '/messages/' + historyItem.itemId + '/history/' + historyItem.id,
        data,
    ).catch(error => {
        throw new Error('Connection error: ' + error.message);
    });

    if (result) {
        return dataStore.setMessageHistoryItemRead({
            messageId: historyItem.itemId,
            historyItemId: historyItem.id,
            isUnread: historyItem.isUnread,
        });
    }
    return true;
}

export {
    fetchLabels,
    fetchMessagesData,
    addMessages,
    updateMessage,
    fetchStepsDataToStore,
    getMessage,
    sendEmail,
    fetchTemplates,
    markHistoryItemUnread,
};
