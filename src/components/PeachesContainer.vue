<template>
    <v-app>
        <v-sheet class="pa-md-4">
            <v-select
                :items="labels"
                label="Filtreeri teema"
                single-line
                bottom
                v-model="labelFilter"
                @change="labelFilterChanged"
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
                                :submitted="submitted"
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
    </v-app>
</template>

<script>
import PeachesListPane from './PeachesListPane';
import PeachesDetailPane from './PeachesDetailPane';

export default {
    name: 'PeachesContainer',
    components: {
        PeachesListPane,
        PeachesDetailPane,
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.statuses = Object.values(this.stateData);
        },
        rowSelected(item) {
            this.selectedItem = item.id;
        },
        tabChanged(tab) {
            console.log('Tab is now: ' + JSON.stringify(this.statuses[tab]));
            this.selectedTab = tab;
        },
        labelFilterChanged() {
            console.log('Labelfilter: ' + JSON.stringify(this.labelFilter));
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
                email: elem.email,
                name: elem.name,
                content: elem.content,
            }));
        },
    },
    data() {
        return {
            selectedItem: '1',
            labelFilter: [],
            selectedTab: '',
            statuses: [],
            labels: [],
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
            labelsData: [
                { id: '001', name: 'Praktiline arvuti baaskoolitus' },
                { id: '002', name: 'MS Office komplekskoolitus' },
                { id: '003', name: 'Exceli baaskursus' },
                { id: '004', name: 'Funktsioonid ja valemid Excelis' },
                { id: '005', name: 'Fotograafia ABC' },
                { id: '006', name: "PhotoShop'i algkoolitus" },
                { id: '007', name: 'Tootefoto pildistamine ja töötlus' },
                { id: '008', name: 'Esmaabi' },
                { id: '009', name: 'Canva' },
                { id: '010', name: 'Sketchup' },
            ],
            submittedData: [
                {
                    id: '1',
                    form: 1,
                    labelId: '009',
                    state: 'uus',
                    email: 'kati.kaalikas@test.com',
                    name: 'Kati',
                    content: Object.entries({
                        name: 'Kati Kaalikas',
                        message: 'Tahan teha ilusaid asju',
                    }),
                },
                {
                    id: '2',
                    form: 1,
                    labelId: '',
                    state: 'uus',
                    email: 'mati.kaalikas@test.com',
                    name: 'Mati',
                    content: Object.entries({
                        name: 'Mati Kaalikas',
                        message: 'Mul on vaja aiakuur joonestada',
                    }),
                },
                {
                    id: '3',
                    form: 2,
                    labelId: '010',
                    state: 'uus_aeg',
                    email: 'uudo.uugamets@test.com',
                    name: 'Uudo',
                    content: Object.entries({
                        name: 'Uudo Uugamets',
                        message:
                            'Tahan tulla Sketchupi kursusele, aga aeg ei sobi',
                    }),
                },
            ],
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
