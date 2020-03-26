<template>
    <v-data-table
        :headers="headers"
        :items="emailHistory"
        :single-expand="true"
        :expanded.sync="expanded"
        item-key="id"
        show-expand=""
        hide-default-footer
    >
        <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
                <v-textarea
                    :value="item.contentMessage"
                    messages="test test test"
                    readonly
                    auto-grow
                    light
                    no-resize
                    hide-details
                >
                </v-textarea>
            </td>
        </template>
    </v-data-table>
</template>
<script>
export default {
    props: {
        history: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            expanded: [],
            headers: [
                { text: this.$locStr('Date'), value: 'dateTime' },
                { text: this.$locStr('Status'), value: 'changeSubType' },
                { text: this.$locStr('To'), value: 'contentTo' },
            ],
        };
    },
    computed: {
        emailHistory() {
            return this.history.reduce((accumulator, item) => {
                if (item.changeType === 'EMAIL_SENT') {
                    const content = JSON.parse(item.content);
                    accumulator.push({
                        id: item.id,
                        dateTime: item.create_time,
                        changeSubType: item.changeSubType,
                        contentTo: content.to,
                        contentMessage: content.message,
                        contentSubject: content.subject,
                    });
                }
                return accumulator;
            }, []);
        },
    },
};
</script>
<style lang="sass">
$textarea-padding: 5px
@import '~vuetify/src/styles/styles.sass'
</style>
