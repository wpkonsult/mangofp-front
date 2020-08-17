<template>
    <v-sheet v-if="loaded" class="pa-md-4">
        <h2>Test v.0.0.4</h2>
        <v-select
            :items="labels"
            v-model="labelFilter"
            label="Filter"
            outlined
        ></v-select>
        <v-tabs @change="tabChanged">
            <v-tab v-for="status in statuses" :key="status.order">{{
                status.state
            }}</v-tab>
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
</template>

<script>
import MangoFpListPane from './MangoFpListPane';
import MangoFpDetailPane from './MangoFpDetailPane';
import {
    fetchLabels,
    fetchMessages,
    updateMessage,
    getStates,
    getMessage,
    sendEmail,
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
            //Lazy loading for history
            if (!item.changeHistory) {
                getMessage(item.id, bus);
            }
            this.openSidePane();
        },
        tabChanged(tab) {
            this.selectedTab = tab;
            this.selectedItem = '';
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
                    this.selectedItem = '';
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

            const ret = this.submittedData.map(elem => ({
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
                    addresses: ['wp@nort.ee'],
                    template:
                        'Tere!\n\nSuur tänu! Olete koolitusele registreeritud.\nTäpsema info ja arve saadame enne koolituse algust e-mailile.\n\nTervitustega\nSirli Järviste\n_______________\nN.O.R.T Koolitus\nVaksali 17a, (407), Tartu\nhttps://www.nort.ee\ninfo@nort.ee\ntel. 7428000',
                },
                WAIT4CONF: {
                    addresses: ['wp@nort.ee'],
                    template:
                        'Tere!\n\nSuur tänu! Olete koolitusele registreeritud.\n\nSaadan Töötukassasse ära registreerimisteate ja annan teada kui neilt kinnitus saabub.\n\nTervitustega\nSirli Järviste\n_______________\nN.O.R.T Koolitus\nVaksali 17a, (407), Tartu\nhttps://www.nort.ee\ninfo@nort.ee\ntel. 7428000',
                },
                CONFRECEIVED: {
                    addresses: ['wp@nort.ee'],
                    template:
                        'Tere!\n\nTöötukassalt saabus kinnitus, sellega on nüüd kõik korras ja jääb ainult koolitust oodata.\n\nSaadan enne koolituse algust veel täpsustava infomeili.\n\nTervitades\nSirli Järviste\n_______________\nN.O.R.T Koolitus\nVaksali 17a, (407), Tartu\nhttps://www.nort.ee\ninfo@nort.ee\ntel. 7428000',
                },
                WAIT4ACCEPT: {
                    addresses: ['wp@nort.ee'],
                    template:
                        'Tere!\n\nSuur tänu, et tunnete huvi meie koolituse vastu. Kuna järgmine koolitusaeg ei ole hetkel veel paigas, siis jätame Teid ootelehele ja anname teada kui koolitusaeg selgub.\n\nTervitustega\nSirli Järviste\n_______________\nN.O.R.T Koolitus\nVaksali 17a, (407), Tartu\nhttps://www.nort.ee\ninfo@nort.ee\ntel. 7428000',
                },
                WAIT4NEW: {
                    addresses: ['wp@nort.ee'],
                    template:
                        'Tere!\n\nSuur tänu, et tunnete huvi meie koolituse vastu. Kuna järgmine koolitusaeg ei ole hetkel veel paigas, siis jätame Teid ootelehele ja anname teada kui koolitusaeg selgub.\n\nTervitustega\nSirli Järviste\n_______________\nN.O.R.T Koolitus\nVaksali 17a, (407), Tartu\nhttps://www.nort.ee\ninfo@nort.ee\ntel. 7428000',
                },
                NOTIFIED: {
                    addresses: ['wp@nort.ee'],
                    template:
                        'Tere!\n\nOotame Teid esmaspäeval, 06. novembril kell 10.00, Exceli täiendkoolituse esimesele päevale.\n\nKoolitus toimub NORT Koolituse arvutiklassis, Vaksali 17a, ruum 407, Tartu (sissepääs Vaksali tänavalt, lillepoe ja kohvikuga samast uksest, liftiga 4.korrusele, asume otse lifti vastas.)\n\nPanin kaasa ka koolitusarve. Kui midagi oleks selles vaja muuta, siis andke palun teada.\n\nParkimine -  tänava ääres kellaga 90 min tasuta ja alates kella 18.00-st tasuta. Raudtee äärses parklas ja Tiigi tn äärses parklas on kogu aeg tasuta. Lähim linnaliini peatus on „Vaksali“.\n_______________\nN.O.R.T Koolitus\nVaksali 17a, (407), Tartu\nhttps://www.nort.ee\ninfo@nort.ee\ntel. 7428000',
                },
                NEWSLETTER: {
                    addresses: ['wp@nort.ee'],
                    template:
                        'Tere!\n\nAitäh, et liitusite meie uudiskirjaga!.\n\nTänutäheks pakume Teile koolitusel osalemiseks soodustust -10%. (Soodustuse saamiseks, kirjutage koolitusele registreerumisel lisainfo lahtrisse sõna - "uudiskiri") Meie koolituskalendri leiate aadressilt https://nort.ee/koolituskalender/ \n\nKui on küsimusi, siis vastan meeleldi.\n\nTervitustega\nSirli Järviste\n_______________\nN.O.R.T Koolitus\nVaksali 17a, (407), Tartu\nhttps://www.nort.ee\ninfo@nort.ee\ntel. 7428000',
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
