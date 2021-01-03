<template>
    <v-container>
        <v-row>
            <v-select
                :class="{ 'margin-left': '-180px' }"
                :items="actions"
                :label="$locStr('State')"
                v-model="actionObj"
                @change="actionSelected"
            >
            </v-select>
        </v-row>
        <div v-if="emailContent">
            <MangoFpEmailForm
                :emailFormName="actionName"
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
                        {{ $locStr('Apply') }}
                    </v-btn>
                </template>
            </MangoFpEmailForm>
        </div>
        <v-btn outlined color="blue darken-1" @click.native="confirm">
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
        };
    },
    methods: {
        clear() {
            this.emailContent = '';
            this.addresses = [];
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
            this.emailSubject = 'Re: ' + this.details.label;

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
