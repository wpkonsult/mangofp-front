<template>
    <v-sheet>
        <v-tabs>
            <v-tab>
                <v-icon left>mdi-account</v-icon>
                Uus
            </v-tab>
            <v-tab>
                <v-icon left>mdi-watch</v-icon>
                Kinnituse ootel
            </v-tab>
            <v-tab-item>
                <v-data-table :headers="headers" :items="submitted">
                    <template slot="body" slot-scope="props">
                        <tbody>
                            <tr
                                v-for="item in props.items"
                                :key="item.id"
                                @click="navigate(item)"
                            >
                                <td>{{ item.label }}</td>
                                <td>{{ item.state }}</td>
                                <td>{{ item.email }}</td>
                                <td>{{ item.content }}</td>
                            </tr>
                        </tbody>
                    </template>
                </v-data-table>
            </v-tab-item>
            <v-tab-item>
                teine tab
            </v-tab-item>
        </v-tabs>
    </v-sheet>
</template>

<script>
export default {
    name: 'PeachesListPane',
    data: () => ({
        search: '',
        navigate: (item) => {
            console.log('We navigated to:');
            console.log(JSON.stringify(item));
        },
        headers: [
            { text: 'Teema', align: 'left', value: 'label', width: '1%' },
            { text: 'Olek', align: 'left', value: 'state', width: '1%' },
            { text: 'Email', align: 'left', value: 'email', width: '1%' },
            { text: 'Sisu', align: 'left', value: 'content' },
        ],
        submitted: [
            {
                id: 1,
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
                id: 2,
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
                id: 3,
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
