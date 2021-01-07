<template>
    <v-row class="detailPane">
        <v-col cols="12" class="pa-2">
            <v-expansion-panels v-model="dataOpen" multiple>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        {{
                            $locStr('Contact data for ') +
                                ' ' +
                                details.email +
                                (selectedLabel.text
                                    ? ', ' + selectedLabel.text
                                    : '')
                        }}
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-sheet v-if="selectedItem">
                            {{ $locStr('Change') }}
                            <v-select
                                :class="{ 'margin-left': '-180px' }"
                                :items="labels"
                                v-model="selectedLabel"
                                :label="$locStr('Label')"
                            >
                            </v-select>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field
                                        class="detailField"
                                        v-model="details.name"
                                        :label="$locStr('Name')"
                                        @change="nameChanged"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field
                                        class="detailField"
                                        v-model="details.email"
                                        :label="$locStr('Email')"
                                        @change="emailChanged"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-textarea
                                flat
                                class="detailField"
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

            let minRows = 5;
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
</style>
