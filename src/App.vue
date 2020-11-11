<template>
    <v-app>
        <v-main>
            <MangoFpContainer />
        </v-main>
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
