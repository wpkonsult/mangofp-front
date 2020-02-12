<template>
    <v-app>
        <v-content>
            <MangoFpContainer />
        </v-content>
    </v-app>
</template>

<script>
import MangoFpContainer from './components/MangoFpContainer';

export default {
    name: 'App',

    components: {
        MangoFpContainer,
    },
};
</script>
