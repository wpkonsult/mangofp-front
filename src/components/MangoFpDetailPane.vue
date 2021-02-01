<template>
    <v-row class="detailPane">
        <div class="ml-auto pt-2 pr-2 mb-n1">
            <v-btn
                x-small
                class="small-action-button"
                color="gray"
                icon
                @click="closeDetailsPane"
            >
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </div>
        <v-col cols="12" class="pa-2">
            <v-expansion-panels v-model="dataOpen" multiple>
                <v-expansion-panel>
                    <v-expansion-panel-header class="pb-1">
                        <template v-slot:default="{ open }">
                            <div v-if="!open">
                                <v-row class="d-flex">
                                    <div class="mr-2 pl-2 actionHeader">
                                        {{ $locStr('Contact data for') }}:
                                    </div>
                                    <div>
                                        {{ getContactDataSummary() }}
                                    </div>
                                </v-row>
                                <div class="pt-3 content-on-detail-header">
                                    <MangoFpMessageInList
                                        v-bind:content="details.content"
                                    />
                                </div>
                                <v-row>
                                    <v-col cols="12" class="notePreview pl-2">
                                        {{ details.note }}
                                    </v-col>
                                </v-row>
                            </div>
                            <div v-else>
                                <v-row no-gutters>
                                    <div class="actionHeader">
                                        <div>
                                            {{ $locStr('Change Contact Data') }}
                                        </div>
                                    </div>
                                </v-row>
                            </div>
                        </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-sheet v-if="selectedItem">
                            <div class="d-flex flex-row email-details-on-cd">
                                <div class="labelText align-self-center mr-2">
                                    {{ $locStr('Label') }}
                                </div>
                                <v-select
                                    class="mb-0 pb-1"
                                    :items="labels"
                                    v-model="selectedLabel"
                                >
                                </v-select>
                            </div>
                            <v-row no-gutters class="email-details-on-cd">
                                <v-col cols="6" class="d-flex flex-row">
                                    <div
                                        class="labelText align-self-center mr-2 pb-4"
                                    >
                                        {{ $locStr('Name') }}
                                    </div>
                                    <v-text-field
                                        class="detailField pt-0"
                                        v-model="details.name"
                                        @change="nameChanged"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6" class="d-flex flex-row">
                                    <div
                                        class="labelText align-self-center ml-2 mr-2 pb-4"
                                    >
                                        {{ $locStr('Email') }}
                                    </div>
                                    <v-text-field
                                        class="detailField pt-0"
                                        v-model="details.email"
                                        @change="emailChanged"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-textarea
                                flat
                                class="detailField pt-0"
                                :rows="rowsForNote"
                                v-model="details.note"
                                :label="$locStr('Note')"
                                @change="noteChanged"
                            ></v-textarea>
                            <v-expansion-panels
                                v-model="contentOpen"
                                multiple
                                tile
                            >
                                <v-expansion-panel>
                                    <v-expansion-panel-header>
                                        {{ $locStr('Additional content') }}
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <MangoFpMessageInList
                                            class="contentInDetail"
                                            v-bind:content="details.content"
                                        />
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-sheet>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-col>
        <v-col cols="12">
            <v-card>
                <v-tabs v-if="globalState.templateLoaded">
                    <v-tab>
                        <v-icon left>mdi-history</v-icon>
                        {{ $locStr('Action') }}
                    </v-tab>
                    <v-tab>
                        <v-icon left>mdi-email-outline</v-icon>
                        {{ $locStr('Messages') }}
                    </v-tab>
                    <v-tab-item
                        transition="fade-transition"
                        reverse-transition="false"
                    >
                        <MangoFpStateSelector
                            :selectedTab="selectedTab"
                            :statuses="statuses"
                            :contactDetails="details"
                            :emailTemplates="emailTemplates"
                            :details="details"
                        />
                    </v-tab-item>
                    <v-tab-item
                        transition="fade-transition"
                        reverse-transition="false"
                    >
                        <MangoFpEmail
                            :selectedTab="selectedTab"
                            :emailTemplates="emailTemplates"
                            :details="details"
                        />
                        <MangoFpEmailHistory
                            :history="details.changeHistory || []"
                        >
                        </MangoFpEmailHistory>
                    </v-tab-item>
                </v-tabs>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import MangoFpStateSelector from './MangoFpStateSelector';
import MangoFpEmailHistory from './MangoFpEmailHistory';
import MangoFpMessageInList from './MangoFpMessageInLinst';
import MangoFpEmail from './MangoFpEmail';
import { bus, dataStore } from '../main';
import { fetchTemplates } from '../controllers/messages';

export default {
    name: 'MangoFpDetailPane',
    components: {
        MangoFpStateSelector,
        MangoFpEmailHistory,
        MangoFpEmail,
        MangoFpMessageInList,
    },
    methods: {
        labelChanged(value) {
            bus.$emit('EventMessageLabelChanged', {
                message: { ...this.details, labelId: value },
            });
        },
        emailChanged(value) {
            bus.$emit('EventEmailLabelChanged', {
                message: { ...this.details, email: value },
            });
        },
        nameChanged(value) {
            bus.$emit('EventNameLabelChanged', {
                message: { ...this.details, name: value },
            });
        },
        noteChanged(value) {
            bus.$emit('EventNoteChanged', {
                message: { ...this.details, note: value },
            });
        },
        getContactDataSummary() {
            return (
                this.details.email +
                (this.selectedLabel.text ? ', ' + this.selectedLabel.text : '')
            );
        },

        closeDetailsPane() {
            this.$emit('CloseDetails');
        },
    },
    computed: {
        actions() {
            if (
                this.selectedTab &&
                this.statuses[this.selectedTab] &&
                this.statuses[this.selectedTab].next &&
                !Array.isArray(this.statuses[this.selectedTab].next)
            ) {
                return [];
            }
            const names = {};
            Object.values(this.statuses).forEach(element => {
                names[element.code] = element.action;
            });

            return this.statuses[this.selectedTab].next.map(code => ({
                code,
                name: names[code],
            }));
        },
        details() {
            const emptyData = {
                email: '',
                name: '',
                label: '',
                labelId: '',
                note: '',
                content: [],
            };

            if (!this.selectedItem) {
                return emptyData;
            }
            const data = this.submitted.find(s => s.id === this.selectedItem);
            if (data) {
                return {
                    name: data.name,
                    email: data.email,
                    label: data.label,
                    labelId: data.labelId,
                    id: data.id,
                    note: data.note,
                    changeHistory: data.changeHistory,
                    content: data.content,
                };
            }

            return emptyData;
        },
        rowsForNote() {
            if (!this.selectedItem) {
                return 1;
            }

            let maxRows = 30;

            let minRows = 1;
            const data = this.submitted.find(s => s.id === this.selectedItem);
            if (!data.note) {
                return minRows;
            }
            let rows = parseInt(data.note.length / 45);
            return minRows > rows ? minRows : maxRows < rows ? maxRows : rows;
        },
        selectedLabel: {
            get() {
                const data = this.details;
                const fetchedLabel = this.labelsData.find(
                    i => i.id === data.labelId,
                );
                if (!fetchedLabel) {
                    return { value: '', text: '' };
                }
                return { value: data.labelId, text: fetchedLabel.name } || '';
            },
            set(newValue) {
                this.labelChanged(newValue);
            },
        },
        labels() {
            return this.labelsData.map(item => ({
                value: item.id,
                text: item.name,
            }));
        },
        emailTemplates() {
            return this.globalState.emailTemplates;
        },
    },
    props: {
        selectedItem: {
            type: String,
            required: false,
        },
        labelsData: {
            type: Array,
            required: true,
        },
        submitted: {
            type: Array,
            required: true,
        },
        selectedTab: {
            type: Number,
            required: true,
        },
        statuses: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            globalState: dataStore,
            contentOpen: [0],
            dataOpen: [],
        };
    },
    async mounted() {
        fetchTemplates();
    },
};
</script>
<style>
@import '../assets/css/mangofp.css';
.detailField input,
.detailField input:focus {
    margin-top: 5px;
    border-style: hidden;
    box-shadow: 0 0 0 transparent;
}

.contentInDetail {
    font-size: 1rem;
    padding: 0px;
    padding-top: 5px;
}

.detailPane {
    background-color: rgb(241, 241, 241);
}
.contactDetailsLabel {
    font-size: 15px;
}

.notePreview {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100px;
    color: rgba(0, 0, 0, 0.87);
    font-size: 13px;
}

.content-on-detail-header strong {
    color: rgba(0, 0, 0, 0.54);
    font-weight: normal;
}

.email-details-on-cd .labelText {
    color: rgba(0, 0, 0, 0.54);
    font-size: 15px;
}
</style>
