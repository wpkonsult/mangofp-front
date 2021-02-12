<template>
    <v-expansion-panels>
        <v-expansion-panel v-for="item in emailHistory" :key="item.id">
            <v-expansion-panel-header class="pb-0">
                <template v-slot:default="{ open }">
                    <div>
                        <v-row no-gutters>
                            <v-col cols="3">
                                {{ getFormattedDate(item.dateTime) }}
                            </v-col>
                            <v-col cols="3">
                                <v-chip
                                    class="mt-n1"
                                    small
                                    :color="getItemType(item).color"
                                    outlined
                                >
                                    <v-icon left>
                                        {{ getItemType(item).icon }}
                                    </v-icon>
                                    {{ getItemType(item).name }}
                                </v-chip>
                            </v-col>
                            <v-col
                                cols="6"
                                v-if="!open"
                                class="emailExplanationHeader"
                            >
                                <div>
                                    {{ getExplanation(item) }}
                                </div>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col
                                class="emailContentPreview"
                                cols="12"
                                v-if="!open"
                            >
                                {{ getContentPreview(item.contentMessage) }}
                            </v-col>
                        </v-row>
                    </div>
                </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <div class="d-flex flex-row">
                    <div class="emailContentHeaderLabel">
                        {{ $locStr('To') }}:
                    </div>
                    <div class="emailContentHeader">{{ item.contentTo }}:</div>
                </div>
                <div class="d-flex flex-row">
                    <div class="emailContentHeaderLabel">
                        {{ $locStr('Subject') }}:
                    </div>
                    <div class="emailContentHeader">
                        {{ item.contentSubject }}
                    </div>
                </div>
                <div v-html="item.contentMessage"></div>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>
<script>
import { dataStore } from '../main';
import { getFormattedDate } from '../plugins/utils';

export default {
    name: 'MangoFpEmailHistory',
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

            messageTypes: {
                step: {
                    color: 'primary',
                    icon: 'mdi-label-outline',
                    name: this.$locStr('unknown step'),
                },
                none: {
                    color: 'indigo',
                    icon: 'mdi-email-outline',
                    name: this.$locStr('email'),
                },
                reply: {
                    color: 'success',
                    icon: 'mdi-reply-outline',
                    name: this.$locStr('reply'),
                },
                default: {
                    color: 'indigo',
                    icon: 'mdi-note-text-outline',
                    name: this.$locStr('other action'),
                },
            },
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
                        changeType: item.changeType,
                        changeSubType: item.changeSubType,
                        contentTo: content.to,
                        contentMessage: content.message,
                        contentSubject: content.subject,
                    });
                } else if (item.changeType === 'EMAIL_RECEIVED') {
                    const content = JSON.parse(item.content);
                    accumulator.push({
                        id: item.id,
                        dateTime: item.create_time,
                        changeType: item.changeType,
                        changeSubType: 'reply',
                        contentTo: '',
                        contentFrom: content.from,
                        contentMessage: content.message,
                        contentSubject: content.subject,
                    });
                }
                return accumulator;
            }, []);
        },
        allSteps() {
            try {
                return dataStore.getSteps();
            } catch (e) {
                return {};
            }
        },
    },
    methods: {
        getFormattedDate(dateIsoString) {
            return getFormattedDate(dateIsoString);
        },
        getExplanation(item) {
            return (
                item.contentSubject || this.$locStr('To') + ':' + item.contentTo
            );
        },

        getContentPreview(value) {
            let elem = document.createElement('div');
            elem.innerHTML = value;
            return elem.textContent || '';
        },
        getItemType(item) {
            const itemType = item.changeSubType || 'default';

            if (itemType in this.allSteps) {
                const name = this.allSteps[itemType].state || itemType;
                return { ...this.messageTypes['step'], name };
            }

            if (itemType in this.messageTypes) {
                return this.messageTypes[itemType];
            }

            return this.messageTypes['default'];
        },
    },
};
</script>
<style lang="sass">
$textarea-padding: 5px
@import '~vuetify/src/styles/styles.sass'

.emailContentPreview
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    width: 10px
    color: rgba(0, 0, 0, 0.87)
    font-size: 13px
.emailContentHeaderLabel
    font-weight: 500
    margin-right: 5px
.emailContentDetails
    div
        border-color: white !important
    .ql-toolbar
        display: none !important
    .ql-editor
        padding-left: 0px
        padding-right: 0px
        p
            font-size: 14px
</style>
