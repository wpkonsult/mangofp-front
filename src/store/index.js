export default class DataStore {
    constructor() {
        this.steps = false;
        this.emailTemplates = {};
        this.templateLoaded = false;
        this.messagesData = [];
    }

    setTemplate(
        stepCode,
        data = { addresses: [], ccAddresses: [], template: '' },
    ) {
        const { addresses = [], ccAddresses = [], template = '' } = data;
        this.emailTemplates = Object.assign({}, this.emailTemplates, {
            [stepCode]: { addresses, ccAddresses, template },
        });
    }

    setTemplatesLoaded(loaded = true) {
        this.templateLoaded = loaded;
    }

    setStep(code, stepObj) {
        if (!this.steps) {
            this.steps = {};
        }

        if (!('code' in stepObj)) {
            throw new Error('code not found in stepObj');
        }

        if (!('action' in stepObj)) {
            throw new Error('action not found in stepObj');
        }
        if (!('order' in stepObj)) {
            throw new Error('order not found in stepObj');
        }

        this.steps[code] = { ...stepObj };
        return this;
    }

    getSteps() {
        if (!this.steps) {
            throw new Error('Steps not loaded yet');
        }
        return this.steps;
    }

    resetSteps() {
        //just in case - will not leave anything for garbage collection
        for (const elem in this.steps) {
            delete this.steps[elem];
        }

        return this;
    }

    findMessage(messageId) {
        return this.messagesData.find(m => m.id === messageId);
    }

    resetMessages() {
        this.messagesData.splice(0, this.messageData.length);
        return true;
    }

    addMessage(messageData) {
        this.messagesData.push(messageData);
        return true;
    }

    getMessageHistory(messageId) {
        let message = this.findMessage(messageId);
        if (!message) {
            return false;
        }
        return message.changeHistory;
    }

    setMessageHistoryItemRead(params) {
        //Set message read when all history items are read,
        //set message unread when at least one history item unread
        let message = this.findMessage(params.messageId);
        if (!message) {
            throw new Error('message not found for history item update');
        }

        if (
            !('changeHistory' in message) ||
            !Array.isArray(message['changeHistory'])
        ) {
            throw new Error(
                'Message history not loaded yet - unable to set UnRead',
            );
        }

        const historyItemId = params.historyItemId;
        let historyItem = message.changeHistory.find(
            h => h.id === historyItemId,
        );

        if (!historyItem) {
            throw new Error('History item not found for history item update');
        }

        historyItem.isUnread = params.isUnread;

        if (params.isUnread) {
            message.isUnread = true;
        } else {
            const foundUrenadHItem = message.changeHistory.find(
                h => h.isUnread,
            );
            if (foundUrenadHItem) {
                message.isUnread = true;
            } else {
                message.isUnread = false;
            }
        }
        return true;
    }
}
