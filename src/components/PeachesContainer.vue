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
                        <v-col cols="6" md="8">
                            <PeachesListPane
                                value="0"
                                :submitted="filtered"
                                :selectedItem="selectedItem"
                                :labelsData="labelsData"
                                @row-selected="rowSelected"
                            />
                        </v-col>
                        <v-col cols="6" md="4">
                            <PeachesDetailPane
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
import PeachesListPane from './PeachesListPane';
import PeachesDetailPane from './PeachesDetailPane';
import {
    fetchLabels,
    fetchMessages,
    updateMessage,
} from './../controllers/messages';
import { bus } from '../main';

export default {
    name: 'PeachesContainer',
    components: {
        PeachesListPane,
        PeachesDetailPane,
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
            console.log('Error: ' + e.message);
            this.error = e.message;
        }
    },
    methods: {
        rowSelected(item) {
            this.selectedItem = item.id;
        },
        tabChanged(tab) {
            this.selectedTab = tab;
        },
        subscribe() {
            bus.$on('EventMessageLabelChanged', payload => {
                console.log(
                    'Event EventMessageLabelChanged triggered: ' +
                        JSON.stringify(payload),
                );
                updateMessage(payload, bus);
            });
            bus.$on('EventEmailLabelChanged', payload => {
                console.log(
                    'Event EventEmailLabelChanged triggered: ' +
                        JSON.stringify(payload),
                );
                updateMessage(payload, bus);
            });
            bus.$on('ErrorConnection', payload => {
                console.log('ErrorConnection raised: ' + payload.error);
                this.error = payload.error;
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
            loaded: false,
            labelFilter: '000',
            selectedTab: 1,
            statuses: [],
            stateData: {
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
            },
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
