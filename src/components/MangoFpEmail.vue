<template>
    <v-container>
        <v-row no-gutters>
            <v-col>
                <v-card>
                    <MangoFpEmailForm
                        v-if="composingInProgress"
                        :emailFormName="$locStr('Send email')"
                        :emailContent="emailContent"
                        :emailSubject="emailSubject"
                        :addresses="addresses"
                        :ccaddresses="ccaddresses"
                        :contactEmail="details.email"
                        @sendEmail="send"
                        @cancelEmail="cancelEmail"
                    >
                    </MangoFpEmailForm>
                    <div v-else class="pa-5">
                        <v-btn color="primary" outlined @click="createNewEmail">
                            {{ $locStr('New email') }}
                        </v-btn>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { bus } from '../main';
import MangoFpEmailForm from './MangoFpEmailForm';
export default {
    name: 'MangoFpEmail',
    components: {
        MangoFpEmailForm,
    },
    data() {
        return {
            composingInProgress: false,
            emailContent: '',
            attachments: [],
            ccaddresses: [],
            disabledWhileActionInProgress: false,
        };
    },
    computed: {
        addresses() {
            return [this.details.email];
        },
        emailSubject() {
            return this.details.label || '';
        },
    },
    methods: {
        send(values) {
            bus.$emit('EventSendEmail', {
                messageId: this.details.id,
                emailContent: values.emailContent,
                emailSubject: values.emailSubject,
                addresses: values.addresses,
                ccAddresses: values.ccAddresses,
                emailAttachments: values.emailAttachments,
            });
            this.composingInProgress = false;
        },
        createNewEmail() {
            this.composingInProgress = true;
            this.emailContent = '';
            this.attachments = [];
        },
        cancelEmail() {
            this.composingInProgress = false;
            this.emailContent = '';
            this.attachments = [];
        },
    },
    watch: {
        details(newDetails) {
            if (newDetails) {
                this.cancelEmail();
            }
        },
    },
    props: {
        selectedTab: {
            type: Number,
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
};
</script>
<style>
@import '../assets/css/mangofp.css';
</style>
