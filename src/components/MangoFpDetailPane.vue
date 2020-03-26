<template>
    <v-flex xs12 sm12>
        <v-tabs vertical>
            <v-tab>
                <v-icon left>mdi-history</v-icon>
            </v-tab>
            <v-tab>
                <v-icon left>mdi-border-color</v-icon>
            </v-tab>
            <v-tab>
                <v-icon left>mdi-email-outline</v-icon>
            </v-tab>
            <v-tab-item transition="fade-transition" reverse-transition="false">
                <MangoFpStateSelector
                    :selectedTab="selectedTab"
                    :statuses="statuses"
                    :contactDetails="details"
                    :emailTemplates="emailTemplates"
                    :details="details"
                />
                <MangoFpEmailHistory :history="details.changeHistory || []">
                </MangoFpEmailHistory>
            </v-tab-item>
            <v-tab-item transition="fade-transition" reverse-transition="false">
                <v-sheet v-if="selectedItem">
                    Muuda andmeid:
                    <v-select
                        :class="{ 'margin-left': '-180px' }"
                        :items="labels"
                        v-model="selectedLabel"
                        label="Teema"
                    >
                    </v-select>
                    <v-text-field
                        class="emailInput"
                        v-model="details.email"
                        label="Email"
                        @change="emailChanged"
                    ></v-text-field>
                </v-sheet>
            </v-tab-item>
            <v-tab-item transition="fade-transition" reverse-transition="false">
                <MangoFpEmail
                    :selectedTab="selectedTab"
                    :contactDetails="details"
                    :emailTemplates="emailTemplates"
                    :details="details"
                />
                <MangoFpEmailHistory :history="details.changeHistory || []">
                </MangoFpEmailHistory>
            </v-tab-item>
        </v-tabs>
    </v-flex>
</template>

<script>
import MangoFpStateSelector from './MangoFpStateSelector';
import MangoFpEmailHistory from './MangoFpEmailHistory';
import MangoFpEmail from './MangoFpEmail';
import { bus } from '../main';

export default {
    name: 'MangoFpDetailPane',
    components: {
        MangoFpStateSelector,
        MangoFpEmailHistory,
        MangoFpEmail,
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
            const emptyData = { email: '', name: '', label: '', labelId: '' };

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
                    changeHistory: data.changeHistory,
                };
            }

            return emptyData;
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
        emailTemplates: {
            type: Object,
            required: false,
        },
    },
};
</script>
<style>
.emailInput input {
    margin-top: 5px;
    border-style: hidden;
}
</style>
