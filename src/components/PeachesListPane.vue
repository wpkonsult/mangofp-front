<template>
    <v-sheet>
        <v-data-table :headers="headers" :items="submitted">
            <template slot="body" slot-scope="props">
                <tbody>
                    <tr
                        v-for="item in props.items"
                        :key="item.id"
                        @click="selectItem(item)"
                    >
                        <td>{{ item.label }}</td>
                        <td>{{ item.state }}</td>
                        <td>{{ item.email }}</td>
                        <td>
                            <PeachesMessageInList
                                v-bind:content="item.content"
                            />
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-data-table>
    </v-sheet>
</template>

<script>
import PeachesMessageInList from './PeachesMessageInLinst';

export default {
    name: 'PeachesListPane',
    components: {
        PeachesMessageInList,
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
            { text: 'Email', align: 'left', value: 'email', width: '1%' },
            { text: 'Sisu', align: 'left', value: 'content' },
        ],
    }),
};
</script>
