<template>
    <v-app>
        <v-sheet class="pa-md-4">
            <v-select
                :items="labelValues"
                label="Filtreeri teemad"
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
                    <v-container>
                        <h2>{{ status.state }}</h2>
                        <v-row align="stretch">
                            <v-col cols="6" md="8">
                                <PeachesListPane
                                    value="0"
                                    :submitted="submitted"
                                    @row-selected="rowSelected"
                                />
                            </v-col>
                            <v-col cols="6" md="4">
                                <PeachesDetailPane
                                    :selectedItem="selectedItem"
                                    :submitted="submitted"
                                    :labels="labelValues"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
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
            this.labelValues = this.labels.map(item => item.name);
        },
        rowSelected(item) {
            this.selectedItem = item.id;
        },
        tabChanged(tab) {
            console.log('Tab is now: ' + JSON.stringify(tab));
            this.selectedTab = tab;
        },
        labelFilterChanged() {
            console.log('Labelfilter: ' + JSON.stringify(this.labelFilter));
        },
    },
    data() {
        return {
            selectedItem: '1',
            labelFilter: [],
            selectedTab: '',
            statuses: [],
            labelValues: [],
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
                    action: 'Ootab uut aega',
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
                    action: 'Määra katkestatuks',
                    next: ['ARCHIVED'],
                },
            },
            labels: [
                { id: '001', name: 'Praktiline arvuti baaskoolitus' },
                { id: '002', name: 'MS Office komplekskoolitus' },
                { id: '003', name: 'Exceli baaskursus' },
                { id: '004', name: 'Funktsioonid ja valemid Excelis' },
                { id: '005', name: 'Fotograafia ABC' },
                { id: '006', name: "PhotoShop'i algkoolitus" },
                { id: '007', name: 'Tootefoto pildistamine ja töötlus' },
                { id: '008', name: 'Esmaabi' },
            ],
            submitted: [
                {
                    id: '1',
                    form: 1,
                    label: 'Canva',
                    state: 'uus',
                    email: 'kati.kaalikas@test.com',
                    content: Object.entries({
                        name: 'Kati Kaalikas',
                        message: 'Tahan teha ilusaid asju',
                    }),
                },
                {
                    id: '2',
                    form: 1,
                    label: 'Sketchup',
                    state: 'uus',
                    email: 'mati.kaalikas@test.com',
                    content: Object.entries({
                        name: 'Mati Kaalikas',
                        message: 'Mul on vaja aiakuur joonestada',
                    }),
                },
                {
                    id: '3',
                    form: 2,
                    label: 'Sketchup',
                    state: 'uus_aeg',
                    email: 'uudo.uugamets@test.com',
                    content: Object.entries({
                        name: 'Uudo Uugamets',
                        message:
                            'Tahan tulla Sketchupi kursusele, aga aeg ei sobi',
                    }),
                },
            ],
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
