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
                <v-container>
                    <v-row align="stretch">
                        <v-col cols="6" md="8">
                            <PeachesListPane
                                :submitted="submitted"
                                @row-selected="rowSelected"
                            />
                        </v-col>
                        <v-col cols="6" md="4">
                            <PeachesDetailPane
                                :selectedItem="selectedItem"
                                :submitted="submitted"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-tab-item>
            <v-tab-item>
                teine tab
            </v-tab-item>
        </v-tabs>
    </v-sheet>
</template>

<script>
import PeachesListPane from './PeachesListPane';
import PeachesDetailPane from './PeachesDetailPane';

export default {
    name: 'PeachesContainer',
    components: {
        PeachesListPane,
        PeachesDetailPane,
    },
    methods: {
        rowSelected: function(item) {
            this.selectedItem = item.id;
        },
    },
    data: function() {
        return {
            selectedItem: '1',
            submitted: [
                {
                    id: '1',
                    form: 1,
                    label: 'Canva',
                    state: 'uus',
                    email: 'kati.kaalikas@test.com',
                    content: Object.entries({
                        name: 'Kati Kaalikas',
                        message: 'Tahan teha ilusaid asju',
                    }),
                },
                {
                    id: '2',
                    form: 1,
                    label: 'Sketchup',
                    state: 'uus',
                    email: 'mati.kaalikas@test.com',
                    content: Object.entries({
                        name: 'Mati Kaalikas',
                        message: 'Mul on vaja aiakuur joonestada',
                    }),
                },
                {
                    id: '3',
                    form: 2,
                    label: 'Sketchup',
                    state: 'uus_aeg',
                    email: 'uudo.uugamets@test.com',
                    content: Object.entries({
                        name: 'Uudo Uugamets',
                        message:
                            'Tahan tulla Sketchupi kursusele, aga aeg ei sobi',
                    }),
                },
            ],
        };
    },
};
</script>
