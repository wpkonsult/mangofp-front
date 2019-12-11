<template>
    <v-container>
        <v-row align="stretch">
            <v-data-table :headers="headers" :items="submitted"></v-data-table>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'PeachesListPane',
    data: () => ({
        search: '',
        headers: [
            { text: 'Vorm', align: 'left', value: 'form' },
            { text: 'Teema', align: 'left', value: 'label' },
            { text: 'Staatus', align: 'left', value: 'state' },
            { text: 'Email', align: 'left', value: 'email' },
            { text: 'Sisu', align: 'left', value: 'content' },
        ],
        submitted: [
            {
                form: 1,
                label: 'Canva',
                state: 'uus',
                email: 'kati.kaalikas@test.com',
                content: JSON.stringify({
                    name: 'Kati Kaalikas',
                    email: 'kati.kaalikas@test.ee',
                    message: 'Tahan teha ilusaid asju',
                }),
            },
            {
                form: 1,
                label: 'Sketchup',
                state: 'uus',
                email: 'mati.kaalikas@test.com',
                content: JSON.stringify({
                    name: 'Mati Kaalikas',
                    email: 'Mati.kaalikas@test.ee',
                    message: 'Mul on vaja aiakuur joonestada',
                }),
            },
            {
                form: 2,
                label: 'Sketchup',
                state: 'uus_aeg',
                email: 'uudo.uugamets@test.com',
                content: JSON.stringify({
                    name: 'Uudo Uugamets',
                    email: 'uudo.uugamets@test.ee',
                    message: 'Tahan tulla Sketchupi kursusele, aga aeg ei sobi',
                }),
            },
        ],
    }),
};
</script>
