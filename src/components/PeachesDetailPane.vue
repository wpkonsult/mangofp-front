<template>
    <v-flex xs12 sm12>
        <v-sheet>
            Siin on detailid. Valitud teade:
            {{ selectedItem || 'pole valitud' }}
            <v-select
                :class="{ 'margin-left': '-180px' }"
                :items="labels"
                label="Teemad"
                @change="labelChanged"
            >
            </v-select>
            <v-sheet v-for="action in actions" :key="action">
                <v-btn class="ma-2" tile outlined color="success">
                    <v-icon left>mdi-pencil</v-icon> {{ action }}
                </v-btn>
            </v-sheet>
        </v-sheet>
    </v-flex>
</template>

<script>
export default {
    name: 'PeachesDetailPane',
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

            return this.statuses[this.selectedTab].next.map(
                code => names[code],
            );
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
    },
};
</script>
