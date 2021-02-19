<template>
    <v-expansion-panels v-model="expanded">
        <v-expansion-panel
            v-for="item in emailHistory"
            :key="item.id"
            :ref="'panel' + item.id"
        >
            <v-expansion-panel-header
                class="pb-0"
                @click="clickOnPanelHeader(item)"
            >
                <template v-slot:default="{ open }">
                    <div>
                        <v-row no-gutters>
                            <v-col cols="3" :class="item.headerClasses">
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
                                <div :class="item.headerClasses">
                                    {{ getExplanation(item) }}
                                </div>
                            </v-col>
                            <v-col cols="6" v-else>
                                <div class="ml-auto">
                                    <div class="text-right">
                                        <v-menu top :close-on-click="true">
                                            <template
                                                v-slot:activator="{ on, attrs }"
                                            >
                                                <v-btn
                                                    class="mr-2 historyItemMenu"
                                                    fab
                                                    outlined
                                                    x-small
                                                    color="primary"
                                                    v-bind="attrs"
                                                    v-on="on"
                                                >
                                                    <v-icon dark>
                                                        mdi-minus
                                                    </v-icon>
                                                </v-btn>
                                            </template>

                                            <v-list>
                                                <v-list-item
                                                    class="historyItemMenuRow"
                                                    v-for="(menuItem,
                                                    index) in menuItems"
                                                    :key="index"
                                                >
                                                    <v-list-item-title
                                                        @click="
                                                            menuItem.action(
                                                                item,
                                                            )
                                                        "
                                                        >{{
                                                            menuItem.title
                                                        }}</v-list-item-title
                                                    >
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </div>
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
                <div class="d-flex flex-row" v-if="item.contentFrom">
                    <div class="emailContentHeaderLabel">
                        {{ $locStr('From') }}:
                    </div>
                    <div class="emailContentHeader">
                        {{ item.contentFrom }}:
                    </div>
                </div>
                <div class="d-flex flex-row" v-if="item.contentTo">
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
import { markHistoryItemUnread } from '../controllers/messages';

export default {
    name: 'MangoFpEmailHistory',
    props: {
        messageId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            expanded: undefined,
            history: dataStore.getMessageHistory(this.messageId) || [],
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
            menuItems: [{ title: 'Mark unread', action: this.markUnread }],
        };
    },
    computed: {
        emailHistory() {
            console.log('Recalculating history ...');
            return this.history.reduce((accumulator, item) => {
                if (item.changeType === 'EMAIL_SENT') {
                    const content = JSON.parse(item.content);
                    accumulator.push({
                        id: item.id,
                        dateTime: item.create_time,
                        changeType: item.changeType,
                        changeSubType: item.changeSubType,
                        contentTo: content.to,
                        contentFrom: '',
                        contentMessage: content.message,
                        contentSubject: content.subject,
                        isUnread: !!item.isUnread,
                        headerClasses: this.boldWhenNew(item),
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
                        isUnread: !!item.isUnread,
                        headerClasses: this.boldWhenNew(item),
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
        boldWhenNew(item) {
            if (item.isUnread) {
                return 'unreadItem';
            }
            return '';
        },
        toggleItemPanel(item) {
            const thePanel = this.$refs['panel' + item.id];
            if (!thePanel) {
                throw new Error('Trying to fetch panel that does not exist');
            }
            thePanel[0].toggle();
        },
        clickOnPanelHeader(item) {
            console.log('Click on panel header');
            console.log('Expanded: ');
            console.log(item);
            //expanded is data that is used for v-model for -expansion-panels.
            //if it has a value then this is an index of open expansion panel
            //if no index, then, panels are closed and we are about to open the panel with item
            //so - lets mark it as read
            if (this.expanded === undefined && item.isUnread) {
                this.markRead(item);
            }
        },
        async markRead(item) {
            let historyItem = this.history.find(el => el.id == item.id);
            if (!historyItem) {
                throw new Error(
                    'Somehow history item is not found for '.item.id,
                );
            }

            console.log('Item about to mark read:');
            markHistoryItemUnread({ ...historyItem, isUnread: false });
        },
        async markUnread(item) {
            let historyItem = this.history.find(el => el.id == item.id);
            if (!historyItem) {
                throw new Error(
                    'Somehow history item is not found for '.item.id,
                );
            }

            console.log('Item about to mark unread:');
            console.log(historyItem);
            const success = await markHistoryItemUnread({
                ...historyItem,
                isUnread: true,
            });
            if (success) {
                this.toggleItemPanel(item);
            }
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
.historyItemMenu
    height: 20px !important
    width: 20px !important
    &:hover
        background-color: #eeeeee
.historyItemMenuRow
    &:hover
        background-color: #eeeeee
.unreadItem
    font-weight: bold
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
