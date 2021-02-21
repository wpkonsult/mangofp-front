<template>
    <v-sheet>
        <v-data-table
            :headers="headers"
            :items="submitted"
            :hide-default-footer="true"
            :disable-pagination="true"
            dense
        >
            <template slot="body" slot-scope="props">
                <tbody>
                    <tr
                        v-for="item in props.items"
                        :key="item.id"
                        @click="selectItem(item)"
                        :class="{ selectedLine: selectedItem === item.id }"
                    >
                        <td :class="getUnreadClass(item)">{{ item.label }}</td>
                        <td :class="getUnreadClass(item)">
                            {{ item.email }}
                        </td>
                        <td :class="getUnreadClass(item)">{{ item.name }}</td>
                        <td>{{ item.note.substr(0, 100) }}</td>
                        <td :class="getUnreadClass(item)">
                            {{ getFormattedDate(item.lastUpdated) }}
                        </td>
                        <td v-if="showDetails">
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
import { getFormattedDate } from '../plugins/utils';

export default {
    name: 'MangoFpListPane',
    components: {
        MangoFpMessageInList,
    },
    methods: {
        selectItem: function(item) {
            this.$emit('row-selected', item);
        },
        getFormattedDate(dateIsoString) {
            return getFormattedDate(dateIsoString);
        },
        getUnreadClass(item) {
            return item.isUnread ? 'unRead' : '';
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
        showDetails: {
            type: Boolean,
            required: false,
        },
    },
    data() {
        return {
            search: '',
        };
    },
    computed: {
        headers() {
            const ret = [
                {
                    text: this.$locStr('Label'),
                    align: 'left',
                    value: 'label',
                    width: '20%',
                },
                {
                    text: this.$locStr('Email'),
                    align: 'left',
                    value: 'email',
                    width: '10%',
                },
                {
                    text: this.$locStr('Name'),
                    align: 'left',
                    value: 'name',
                    width: '10%',
                },
                {
                    text: this.$locStr('Note'),
                    align: 'left',
                    value: 'note',
                    width: '10%',
                },
                {
                    text: this.$locStr('Updated'),
                    align: 'left',
                    value: 'lastUpdated',
                    width: '10%',
                },
            ];

            if (this.showDetails) {
                ret.push({
                    text: 'Sisu',
                    align: 'left',
                    value: 'content',
                    width: '40%',
                });
            }

            ret.push({ text: '', align: 'left', value: '' });
            return ret;
        },
    },
};
</script>
<style>
.selectedLine {
    background-color: #1976d2 !important;
    color: #ffffff;
}

.unRead {
    font-weight: bold;
}
</style>
