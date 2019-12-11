<template>
    <v-container>
        <v-row align="stretch">
            <v-col cols="6" md="8">
                <PeachesListPane />
            </v-col>
            <v-col cols="6" md="4"></v-col>
        </v-row>
    </v-container>
</template>

<script>
import PeachesListPane from './PeachesListPane';

export default {
    name: 'PeachesContainer',
    components: {
        PeachesListPane,
    },
    data: () => ({}),
};
</script>
