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
                        <td>{{ item.state }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.email }}</td>
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
    data: () => ({
        search: '',
        headers: [
            { text: 'Teema', align: 'left', value: 'label', width: '1%' },
            { text: 'Olek', align: 'left', value: 'state', width: '1%' },
            { text: 'Nimi', align: 'left', value: 'name', width: '1%' },
            { text: 'Email', align: 'left', value: 'email', width: '1%' },
            { text: 'Sisu', align: 'left', value: 'content', width: '80%' },
            { text: '', align: 'left', value: '' },
        ],
    }),
};
</script>
<style>
.selectedLine {
    background-color: #1976d2 !important;
    color: #ffffff;
}
</style>
