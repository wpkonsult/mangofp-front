<template>
    <v-flex xs12 sm12>
        <v-sheet>
            Siin on detailid. Valitud teade:
            {{ selectedItem || 'pole valitud' }}
            <v-select
                :class="{ 'margin-left': '-180px' }"
                :items="labels"
                :value="details.labelId"
                @change="labelChanged"
            >
            </v-select>
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
export default {
    name: 'PeachesDetailPane',
    components: {
        PeachesEmailDialog,
    },
    methods: {
        labelChanged(value) {
            console.log('Label value is now: ' + JSON.stringify(value));
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
            const data = this.submitted.find(s => s.id === this.selectedItem);
            if (data) {
                return {
                    name: data.name,
                    email: data.email,
                    label: data.label,
                    labelId: data.labelId,
                };
            }

            return { email: '', name: '', label: '', labelId: '' };
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
