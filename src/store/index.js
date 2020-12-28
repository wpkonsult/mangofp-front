export default class DataStore {
    constructor() {
        this.steps = false;
        this.emailTemplates = {};
        this.templateLoaded = false;
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
            console.log(stepObj);
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
}
