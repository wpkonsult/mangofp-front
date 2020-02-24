<template>
    <v-app>
        <v-sheet v-if="loaded" class="pa-md-4">
            <v-select
                :items="labels"
                v-model="labelFilter"
                label="Filter"
                outlined
            >
            </v-select>
            <v-tabs @change="tabChanged">
                <v-tab v-for="status in statuses" :key="status.order">
                    {{ status.state }}
                </v-tab>
                <v-tab-item v-for="status in statuses" :key="status.code">
                    <h2>{{ status.state }}</h2>
                    <v-row align="stretch">
                        <v-col :cols="listWidth">
                            <MangoFpListPane
                                value="0"
                                :submitted="filtered"
                                :selectedItem="selectedItem"
                                :labelsData="labelsData"
                                @row-selected="rowSelected"
                            />
                        </v-col>
                        <v-col v-if="selectedItem" cols="6">
                            <MangoFpDetailPane
                                :selectedItem="selectedItem"
                                :submitted="submitted"
                                :labelsData="labelsData"
                                :selectedTab="selectedTab"
                                :statuses="statuses"
                                :emailTemplates="emailTemplates"
                            />
                        </v-col>
                    </v-row>
                </v-tab-item>
            </v-tabs>
        </v-sheet>
        <v-sheet v-else class="pa-md-4">
            <p>Loading ...</p>
        </v-sheet>
    </v-app>
</template>

<script>
import MangoFpListPane from './MangoFpListPane';
import MangoFpDetailPane from './MangoFpDetailPane';
import {
    fetchLabels,
    fetchMessages,
    updateMessage,
    getStates,
} from './../controllers/messages';
import { bus } from '../main';

export default {
    name: 'MangoFpContainer',
    components: {
        MangoFpListPane,
        MangoFpDetailPane,
    },
    async mounted() {
        this.subscribe();
        this.statuses = Object.values(this.stateData);
        try {
            [this.labelsData, this.submittedData] = await Promise.all([
                fetchLabels(),
                fetchMessages(),
            ]);
            this.loaded = true;
        } catch (e) {
            this.error = e.message;
        }
    },
    methods: {
        openSidePane() {
            this.listWidth = '6';
        },
        closeSidePane() {
            this.listWidth = '12';
        },
        rowSelected(item) {
            this.selectedItem = item.id;
            this.openSidePane();
        },
        tabChanged(tab) {
            this.selectedTab = tab;
            this.selectedItem = '';
            this.closeSidePane();
        },
        subscribe() {
            bus.$on('EventMessageLabelChanged', payload => {
                updateMessage(payload, bus);
            });
            bus.$on('EventEmailLabelChanged', payload => {
                updateMessage(payload, bus);
            });
            bus.$on('EventMessageStateChanged', payload => {
                updateMessage(
                    {
                        message: {
                            id: payload.messageId,
                            code: payload.newState,
                        },
                    },
                    bus,
                );
            });
            bus.$on('ErrorConnection', payload => {
                this.error = payload.error;
            });
            bus.$on('DataMessageUpdated', message => {
                const updateIndex = this.submittedData.findIndex(
                    el => el.id === message.id,
                );
                if (updateIndex < 0) {
                    this.submittedData.push(message);
                } else {
                    this.submittedData.splice(updateIndex, 1, message);
                }
            });
        },
    },
    computed: {
        submitted() {
            const labelsObj = {};
            this.labelsData.forEach(elem => {
                labelsObj[elem.id] = elem.name;
            });

            return this.submittedData.map(elem => ({
                id: elem.id,
                form: elem.form,
                labelId: elem.labelId,
                label: labelsObj[elem.labelId] || '',
                state: elem.state,
                code: elem.code,
                email: elem.email,
                name: elem.name,
                content: elem.content,
            }));
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

            labels.unshift({ value: '000', text: '--- Kõik ---' });

            return labels;
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
            stateData: getStates(),
            labelsData: [],
            submittedData: [],
            emailTemplates: {
                REGISTERED: {
                    addresses: ['mingiarhiiv@nort.ee'],
                    template:
                        'Väga austatud <<name>> (<<email>>),\n\nOlete regristreerunud kursusele "<<label>>".\n\nLugupidamisega\nÕppekeskus N.O.R.T',
                },
                WAIT4CONF: {
                    addresses: ['mingiarhiiv@nort.ee'],
                    template:
                        'Väga austatud Töötukassa,\n\n<<name>> soovib osaleda kursusel "<<label>>", mis algab ??.??.??. Olete päri?\n\nLugupidamisega,\nÕppekeskus N.O.R.T\n\nP.S. <<name>> emaili aadress on <<email>>',
                },
            },
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
</style>
