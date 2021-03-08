<template>
    <v-container>
        <div class="px-3">
            <v-row no-gutters>
                <v-col cols="12" sm="6">
                    <v-row no-gutters>
                        <v-col class="actionHeader pt-2" cols="12" md="4">
                            {{ $locStr('Next step') }}
                        </v-col>
                        <v-col cols="12" md="8" class="pt-0">
                            <v-select
                                class="pt-md-0"
                                :items="actions"
                                v-model="actionObj"
                                @change="actionSelected"
                            >
                            </v-select>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-row no-gutters>
                        <v-col class="actionHeader pt-2 pl-md-6 toRight">
                            {{ $locStr('Email message') }}
                        </v-col>
                        <v-col class="pt-0 pl-4">
                            <v-switch
                                class="mt-0"
                                inset
                                v-model="enableEmail"
                            ></v-switch>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </div>
        <div v-if="enableEmail">
            <MangoFpEmailForm
                emailFormName=""
                :emailContent="emailContent"
                :emailSubject="emailSubject"
                :addresses="addresses"
                :ccaddresses="ccaddresses"
                :contactEmail="details.email"
                @sendEmail="confirmAndSend"
            >
                <template v-slot:action="actionSlotProps">
                    <v-btn
                        color="blue darken-1"
                        outlined
                        @click.native="actionSlotProps.confirmAndSend"
                        :disabled="
                            actionSlotProps.disabledWhileActionInProgress
                        "
                    >
                        {{ $locStr('Confirm and send') }}
                    </v-btn>
                </template>
            </MangoFpEmailForm>
        </div>
        <v-btn
            v-if="!enableEmail"
            outlined
            color="blue darken-1"
            @click.native="confirm"
        >
            {{ $locStr('Confirm') }}
        </v-btn>
    </v-container>
</template>

<script>
import { bus } from '../main';
import MangoFpEmailForm from './MangoFpEmailForm';

//const CONTANT_EMAIL = '[contactEmail]';

export default {
    name: 'MangoFpStateSelector',
    components: {
        MangoFpEmailForm,
    },
    data() {
        return {
            emailContent: '',
            emailSubject: '',
            addresses: [],
            ccaddresses: [],
            actionName: '',
            actionObj: { value: '', text: '' },
            attachments: [],
            disabledWhileActionInProgress: false,
            enableEmail: false,
        };
    },
    methods: {
        clear() {
            this.emailContent = '';
            this.addresses = ['[contactEmail]'];
            this.ccaddresses = [];
            this.actionName = '';
            this.emailSubject = '';
            this.actionObj = { value: '', text: '' };
        },
        actionSelected(value) {
            const shortcodes = ['name', 'label', 'email', 'note'];
            let content = '';
            if (value in this.emailTemplates) {
                content = this.emailTemplates[value].template;
                this.ccaddresses = [...this.emailTemplates[value].ccAddresses];
                this.addresses = [...this.emailTemplates[value].addresses];
            }
            shortcodes.forEach(element => {
                content = content.replace(
                    new RegExp('<<' + element + '>>', 'g'),
                    this.details[element],
                );
            });

            this.emailContent = content;
            this.enableEmail = !!content;
            this.emailSubject = this.details.label;

            const foundAction = this.actions.find(
                action => action.value === value,
            );
            this.actionName = foundAction.text;
            this.actionObj = foundAction;
        },
        confirmAndSend(values) {
            bus.$emit('EventSendEmailAndChangeState', {
                messageId: this.details.id,
                newState: this.actionObj.value,
                emailContent: values.emailContent,
                emailSubject: values.emailSubject,
                addresses: values.addresses,
                ccAddresses: values.ccAddresses,
                emailAttachments: values.emailAttachments,
            });
        },
        confirm() {
            this.dialog = false;
            bus.$emit('EventMessageStateChanged', {
                messageId: this.details.id,
                newState: this.actionObj.value,
            });
        },
    },
    computed: {
        actions() {
            if (
                this.selectedTab &&
                this.statuses[this.selectedTab] &&
                this.statuses[this.selectedTab].next &&
                !Array.isArray(this.statuses[this.selectedTab].next)
            ) {
                return [];
            }
            const names = {};
            Object.values(this.statuses).forEach(element => {
                names[element.code] = element.action;
            });

            return this.statuses[this.selectedTab].next.map(code => ({
                value: code,
                text: names[code],
            }));
        },
    },
    props: {
        selectedTab: {
            type: Number,
            required: true,
        },
        statuses: {
            type: Array,
            required: true,
        },
        emailTemplates: {
            type: Object,
            required: false,
        },
        details: {
            type: Object,
            required: true,
        },
    },
    created() {
        this.actionSelected(this.actions[0].value);
    },
    watch: {
        details(newDetails) {
            if (newDetails) {
                this.actionSelected(this.actions[0].value);
            }
        },
    },
};
</script>

<style>
@import '../assets/css/mangofp.css';
</style>
