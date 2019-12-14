<template>
    <v-sheet>
        Siin on detailid. Valitud teade: {{ selectedItem || 'pole valitud' }}
    </v-sheet>
</template>

<script>
export default {
    name: 'PeachesDetailPane',
    props: {
        selectedItem: {
            type: String,
            required: false,
        },
        submitted: {
            type: Array,
            required: true,
        },
    },
};
</script>
