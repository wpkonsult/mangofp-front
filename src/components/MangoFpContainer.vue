<template>
    <v-sheet v-if="loaded" class="pa-md-4">
        <v-row no-gutters>
            <v-col cols="6">
                <h2 class>{{ appVersion }}</h2>
            </v-col>
            <v-col>
                <v-select
                    class="generalLabelFilter"
                    :items="labels"
                    v-model="labelFilter"
                    label=""
                    dense
                    outlined
                ></v-select>
            </v-col>
        </v-row>

        <v-tabs @change="tabChanged">
            <v-tab v-for="status in statuses" :key="status.order">{{
                status.state
            }}</v-tab>
            <v-tab-item v-for="status in statuses" :key="status.code">
                <v-row align="stretch">
                    <v-col
                        :cols="listWidth"
                        :lg="listWidth < 12 ? listWidth + 2 : 0"
                    >
                        <MangoFpListPane
                            value="0"
                            :submitted="filtered"
                            :selectedItem="selectedItem"
                            :labelsData="labelsData"
                            @row-selected="rowSelected"
                            :showDetails="!detailPaneIsOpen"
                        />
                    </v-col>
                    <v-col
                        v-if="selectedItem"
                        cols="9"
                        lg="7"
                        class="detailPaneContainer"
                    >
                        <MangoFpDetailPane
                            :selectedItem="selectedItem"
                            :submitted="submitted"
                            :labelsData="labelsData"
                            :selectedTab="selectedTab"
                            :statuses="statuses"
                            @CloseDetails="closeSidePane"
                        />
                    </v-col>
                </v-row>
            </v-tab-item>
        </v-tabs>
    </v-sheet>
    <v-sheet v-else class="pa-md-4">
        <p>Loading ...</p>
    </v-sheet>
</template>

<script>
import MangoFpListPane from './MangoFpListPane';
import MangoFpDetailPane from './MangoFpDetailPane';
import {
    fetchLabels,
    fetchMessagesData,
    setMessages,
    updateMessage,
    fetchStepsDataToStore,
    getMessage,
    sendEmail,
} from './../controllers/messages';
import { bus, dataStore } from '../main';

export default {
    name: 'MangoFpContainer',
    components: {
        MangoFpListPane,
        MangoFpDetailPane,
    },
    async mounted() {
        this.subscribe();
        let messagesData;
        let stepsLoaded;
        try {
            [this.labelsData, messagesData, stepsLoaded] = await Promise.all([
                fetchLabels(),
                fetchMessagesData(),
                fetchStepsDataToStore(),
            ]);
            if (stepsLoaded) {
                this.messagesData = setMessages(messagesData);
                this.statuses = Object.values(dataStore.getSteps());
                this.loaded = true;
            }
        } catch (e) {
            this.error = e.message;
        }
    },
    methods: {
        openSidePane() {
            this.listWidth = 3;
        },
        closeSidePane() {
            this.listWidth = 12;
            this.selectedItem = '';
        },
        rowSelected(item) {
            this.selectedItem = item.id;
            //Lazy loading for history
            if (!item.changeHistory) {
                getMessage(item.id, bus);
            }
            this.openSidePane();
        },
        tabChanged(tab) {
            this.selectedTab = tab;
            this.closeSidePane();
        },
        subscribe() {
            bus.$on('EventMessageLabelChanged', payload => {
                updateMessage(
                    {
                        message: {
                            id: payload.message.id,
                            labelId: payload.message.labelId,
                        },
                    },
                    bus,
                );
            });
            bus.$on('GetMessageDetails', payload => {
                getMessage(payload.id, bus);
            });
            bus.$on('EventEmailLabelChanged', payload => {
                updateMessage(
                    {
                        message: {
                            id: payload.message.id,
                            email: payload.message.email,
                        },
                    },
                    bus,
                );
            });
            bus.$on('EventNameLabelChanged', payload => {
                updateMessage(
                    {
                        message: {
                            id: payload.message.id,
                            name: payload.message.name,
                        },
                    },
                    bus,
                );
            });
            bus.$on('EventNoteChanged', payload => {
                updateMessage(
                    {
                        message: {
                            id: payload.message.id,
                            note: payload.message.note,
                        },
                    },
                    bus,
                );
            });
            bus.$on('EventMessageStateChanged', payload => {
                const success = updateMessage(
                    {
                        message: {
                            id: payload.messageId,
                            code: payload.newState,
                        },
                    },
                    bus,
                );
                if (success) {
                    this.closeSidePane();
                }
            });
            bus.$on('EventSendEmail', payload => {
                sendEmail(
                    {
                        message: {
                            id: payload.messageId,
                            emailContent: payload.emailContent,
                            addresses: payload.addresses,
                            ccAddresses: payload.ccAddresses,
                            emailSubject: payload.emailSubject,
                            emailAttachments: payload.emailAttachments,
                        },
                    },
                    bus,
                );
            });
            bus.$on('EventSendEmailAndChangeState', payload => {
                const success = updateMessage(
                    {
                        message: {
                            id: payload.messageId,
                            code: payload.newState,
                            emailContent: payload.emailContent,
                            addresses: payload.addresses,
                            ccAddresses: payload.ccAddresses,
                            emailSubject: payload.emailSubject,
                            emailAttachments: payload.emailAttachments,
                        },
                    },
                    bus,
                );
                if (success) {
                    this.selectedItem = '';
                }
                this.closeSidePane();
            });
            bus.$on('ErrorConnection', payload => {
                this.error = payload.error;
            });
            bus.$on('DataMessageUpdated', message => {
                const updateIndex = this.messagesData.findIndex(
                    el => el.id === message.id,
                );
                if (updateIndex < 0) {
                    this.messagesData.push(message);
                } else {
                    this.messagesData.splice(updateIndex, 1, message);
                }
            });
        },
    },
    computed: {
        appVersion() {
            if (!window.MANGOFP_RESOURCES.version) {
                return 'NA';
            }
            let version = [];
            for (const [key, value] of Object.entries(
                window.MANGOFP_RESOURCES.version,
            )) {
                version.push(key + ' - ' + value);
            }
            return 'MangoFp version: ' + version.join(', ') || 'older';
        },
        submitted() {
            const labelsObj = {};
            this.labelsData.forEach(elem => {
                labelsObj[elem.id] = elem.name;
            });

            const ret = this.messagesData.map(elem => ({
                ...elem,
                label: labelsObj[elem.labelId] || '',
                changeHistory: elem.changeHistory || false,
            }));

            return ret;
        },
        filtered() {
            return this.submitted.filter(
                elem =>
                    (!this.labelFilter ||
                        this.labelFilter === '000' ||
                        elem.labelId === this.labelFilter) &&
                    elem.code === this.statuses[this.selectedTab].code,
            );
        },
        labels() {
            const labels = this.labelsData.map(item => ({
                value: item.id,
                text: item.name,
            }));

            labels.unshift({
                value: '000',
                text: '--- ' + this.$locStr('All') + ' ---',
            });

            return labels;
        },
        detailPaneIsOpen() {
            return this.listWidth != 12;
        },
    },
    data() {
        return {
            selectedItem: '',
            listWidth: '12',
            loaded: false,
            labelFilter: '000',
            selectedTab: 1,
            statuses: [],
            stateData: [],
            labelsData: [],
            messagesData: [],
        };
    },
};
</script>
<style>
.v-menu__content {
    margin-left: -175px;
}
.v-select.v-text-field input {
    display: none;
}

.generalLabelFilter .v-text-field__details {
    display: none;
}

.detailPaneContainer {
    background-color: rgb(241, 241, 241);
}

@media screen and (max-width: 864px) {
    .v-menu__content {
        margin-left: -55px;
    }
}
</style>
