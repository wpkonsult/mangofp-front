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

    findMessageHistoryItem(messageId, historyItemId) {
        let message = this.findMessage(messageId);
        if (!message) {
            return false;
        }

        return message.changeHistory.find(h => h.id === historyItemId);
    }

    setMessageHistoryItemRead(params) {
        let message = this.findMessageHistoryItem(
            params.messageId,
            params.historyItemId,
        );
        if (!message) {
            throw new Error('message not found for history item update');
        }
        message.isUnread = params.isUnread;
        return true;
    }
}
