<template>
    <v-sheet>
        <v-data-table :headers="headers" :items="submitted">
            <template slot="body" slot-scope="props">
                <tbody>
                    <tr
                        v-for="item in props.items"
                        :key="item.id"
                        @click="selectItem(item)"
                        :class="{ selectedLine: selectedItem === item.id }"
                    >
                        <td>{{ item.label }}</td>
                        <td>{{ item.note }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.email }}</td>
                        <td>{{ item.lastUpdated }}</td>
                        <td>
                            <MangoFpMessageInList
                                v-bind:content="item.content"
                            />
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </template>
        </v-data-table>
    </v-sheet>
</template>

<script>
import MangoFpMessageInList from './MangoFpMessageInLinst';

export default {
    name: 'MangoFpListPane',
    components: {
        MangoFpMessageInList,
    },
    methods: {
        selectItem: function(item) {
            this.$emit('row-selected', item);
        },
    },
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
    data() {
        return {
            search: '',
            headers: [
                {
                    text: this.$locStr('Label'),
                    align: 'left',
                    value: 'label',
                    width: '20%',
                },
                {
                    text: this.$locStr('Note'),
                    align: 'left',
                    value: 'note',
                    width: '10%',
                },
                {
                    text: this.$locStr('Name'),
                    align: 'left',
                    value: 'name',
                    width: '10%',
                },
                {
                    text: this.$locStr('Email'),
                    align: 'left',
                    value: 'email',
                    width: '10%',
                },
                {
                    text: this.$locStr('Updated'),
                    align: 'left',
                    value: 'lastUpdated',
                    width: '10%',
                },
                { text: 'Sisu', align: 'left', value: 'content', width: '40%' },
                { text: '', align: 'left', value: '' },
            ],
        };
    },
};
</script>
<style>
.selectedLine {
    background-color: #1976d2 !important;
    color: #ffffff;
}
</style>
