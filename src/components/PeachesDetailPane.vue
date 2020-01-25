<template>
    <v-flex xs12 sm12>
        <v-sheet>
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
            <v-sheet v-for="action in actions" :key="action.code">
                <PeachesEmailDialog
                    :actionName="action.name"
                    :actionCode="action.code"
                    :content="emailTemplates[action.code]"
                    :name="details.name"
                    :email="details.email"
                    :label="details.label"
                />
            </v-sheet>
        </v-sheet>
    </v-flex>
</template>

<script>
import PeachesEmailDialog from './PeachesEmailDialog';
import { bus } from '../main';

export default {
    name: 'PeachesDetailPane',
    components: {
        PeachesEmailDialog,
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
            console.log('Calculating details for ' + this.selectedItem || 'NA');
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
                console.log('New value is:' + newValue);
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
