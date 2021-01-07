<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card v-if="composingInProgress">
                    <MangoFpEmailForm
                        :emailFormName="$locStr('Send email')"
                        :emailContent="emailContent"
                        :emailSubject="emailSubject"
                        :addresses="addresses"
                        :ccaddresses="ccaddresses"
                        :contactEmail="details.email"
                        @sendEmail="send"
                    >
                    </MangoFpEmailForm>
                </v-card>
                <v-card v-else>
                    <v-card-actions>
                        <v-btn
                            color="blue darken-1"
                            outlined
                            @click.native="createNewEmail"
                        >
                            Compose new email
                        </v-btn>
                    </v-card-actions>
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
        clear() {
            this.emailContent = 'no content';
        },
        send(values) {
            bus.$emit('EventSendEmail', {
                messageId: this.details.id,
                emailContent: values.emailContent,
                emailSubject: values.emailSubject,
                addresses: values.addresses,
                ccAddresses: values.ccAddresses,
                emailAttachments: values.emailAttachments,
            });
        },
        createNewEmail() {
            this.composingInProgress = true;
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
