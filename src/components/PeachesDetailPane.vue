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
    },
    data: function() {
        return {};
    },
};
</script>
