<template>
    <v-flex xs12 sm12>
        <v-sheet>
            Siin on detailid. Valitud teade:
            {{ selectedItem || 'pole valitud' }}
            <v-select
                :class="{ 'margin-left': '-180px' }"
                :items="labels"
                label="Määra teema"
                @change="labelChanged"
            >
            </v-select>
            <v-sheet v-for="action in actions" :key="action.code">
                <PeachesEmailDialog
                    :label="action.label"
                    :state="action.code"
                    :content="emailTemplates[action.code]"
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
        actions: function() {
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
                label: names[code],
            }));
        },
    },
    props: {
        selectedItem: {
            type: String,
            required: false,
        },
        labels: {
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
