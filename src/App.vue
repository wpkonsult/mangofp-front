<template>
    <v-app>
        <v-content>
            <PeachesContainer />
        </v-content>
    </v-app>
</template>

<script>
import PeachesContainer from './components/PeachesContainer';

export default {
    name: 'App',

    components: {
        PeachesContainer,
    },
};
</script>
