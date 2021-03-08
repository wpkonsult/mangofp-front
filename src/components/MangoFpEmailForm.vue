<template>
    <v-card class="mb-5">
        <v-card-title class="pb-0" v-if="emailFormName">
            <div class="d-inline-block">
                {{ emailFormName }}
            </div>
            <div class="d-inline-block ml-auto">
                <v-btn
                    x-small
                    class="small-action-button"
                    color="gray"
                    icon
                    @click="cancel"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </v-card-title>
        <v-card-text class="pt-0 pb-0">
            <v-row no-gutters>
                <v-col class="pb-0 pt-0" cols="12" md="7">
                    <div class="d-flex flex-row">
                        <div class="labelText align-self-center mr-2">
                            {{ $locStr('To') }}
                        </div>
                        <v-text-field
                            class="detailField pt-0"
                            :hint="
                                $locStr(
                                    'Email address or addresses separated with ;',
                                )
                            "
                            v-model="address4Edit"
                            :error="!!addressesError"
                            :error-messages="addressesError"
                            @blur="validateAddresses"
                            @focus="clearAddressErrors"
                        ></v-text-field>
                    </div>
                </v-col>
                <v-col class="pb-0 pt-0" cols="12" md="5">
                    <div class="d-flex flex-row">
                        <div class="labelText align-self-center mr-2 pl-md-2">
                            {{ $locStr('CC') }}
                        </div>
                        <v-text-field
                            class="detailField pt-0"
                            :hint="$locStr('Email CC address(es)')"
                            v-model="ccAddress4Edit"
                            :error="!!ccAddressError"
                            :error-messages="ccAddressError"
                            @blur="validateCCAddresses"
                            @focus="clearCCAddressesErrors"
                        ></v-text-field>
                    </div>
                </v-col>
            </v-row>
            <div class="d-flex flex-row mt-md-n3">
                <div class="labelText align-self-center mr-2">
                    {{ $locStr('Subject') }}
                </div>
                <v-text-field
                    class="detailField pt-0"
                    v-model="emailSubject4Edit"
                ></v-text-field>
            </div>
        </v-card-text>
        <v-card-text class="pb-0 pt-0">
            <vue-editor
                class="emailEditor"
                v-model="emailContent4Edit"
                :editorToolbar="editorToolbar"
            ></vue-editor>
        </v-card-text>
        <v-card-actions class="pt-0 pl-5">
            <slot
                name="action"
                v-bind:confirmAndSend="confirmAndSend"
                v-bind:disabledWhileActionInProgress="
                    disabledWhileActionInProgress
                "
            >
                <v-btn
                    color="blue darken-1"
                    outlined
                    @click.native="confirmAndSend"
                    :disabled="disabledWhileActionInProgress"
                >
                    {{ $locStr('Send') }}
                </v-btn>
            </slot>
            <MangoFpAttachment
                @attachmentsReceived="addAttachments"
                @submittingAttachments="submittingAttachments"
                @submittingAttachmentsFinished="submittingAttachmentsFinished"
            />
        </v-card-actions>
        <v-chip
            class="ma-2"
            color="primary"
            label
            close
            v-for="attachment in attachments"
            :key="attachment.id"
            @click:close="removeAttachment(attachment.id)"
            @click="downloadAttachment(attachment.url)"
        >
            {{ attachment.file_name }}
        </v-chip>
    </v-card>
</template>

<script>
import MangoFpAttachment from './MangoFpAttachment';
import { VueEditor } from 'vue2-editor';

export default {
    name: 'MangoFpEmailForm',
    components: {
        MangoFpAttachment,
        VueEditor,
    },
    data() {
        return {
            attachments: [],
            disabledWhileActionInProgress: false,
            address4Edit: this.getEmailsAsString(this.addresses),
            ccAddress4Edit: this.getEmailsAsString(this.ccaddresses),
            emailContent4Edit: this.emailContent,
            emailSubject4Edit: this.emailSubject,
            addressesError: '',
            ccAddressError: '',
            editorToolbar: [
                [{ header: [false, 1, 2, 3, 4, 5, 6] }],
                ['bold', 'italic', 'underline', 'strike'], // toggled buttons
                [
                    { align: '' },
                    { align: 'center' },
                    { align: 'right' },
                    { align: 'justify' },
                ],
                [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
                [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
                [{ color: [] }, { background: [] }], // dropdown with defaults from theme
                ['link'],
                ['clean'], // remove formatting butto
            ],
        };
    },
    mounted() {
        this.setFocusToEmailText();
    },
    methods: {
        getEmailsAsString(addresses = []) {
            const retArray = addresses.map(email => {
                if (email == '[contactEmail]') {
                    return this.contactEmail;
                } else {
                    return email;
                }
            });
            return retArray.join('; ');
        },
        validateAddresses() {
            try {
                const addresses = this.validateAndGetEmailAddresses(
                    this.address4Edit,
                );
                this.clearAddressErrors();
                return addresses;
            } catch (err) {
                this.addressesError =
                    err.message || 'Error validating messages';
                return false;
            }
        },
        validateCCAddresses() {
            try {
                const addresses = this.validateAndGetEmailAddresses(
                    this.ccAddress4Edit,
                );
                this.clearCCAddressesErrors();
                return addresses;
            } catch (err) {
                this.ccAddressError =
                    err.message || 'Error validating messages';
                return false;
            }
        },
        clearAddressErrors() {
            this.addressesError = '';
        },
        clearCCAddressesErrors() {
            this.ccAddressError = '';
        },
        clearErrors() {
            this.clearAddressErrors();
            this.clearCCAddressesErrors();
        },
        confirmAndSend() {
            this.dialog = false;
            let addresses = this.address4Edit;
            let ccAddresses = this.ccAddress4Edit;
            this.clearErrors();

            if (!this.address4Edit.trim()) {
                this.addressesError = this.$locStr(
                    'Please input email address',
                );
                return false;
            }

            addresses = this.validateAddresses();
            if (!addresses) {
                return false;
            }

            ccAddresses = this.validateCCAddresses();
            if (ccAddresses === false) {
                return false;
            }

            this.$emit('sendEmail', {
                emailContent: this.emailContent4Edit,
                emailSubject: this.emailSubject4Edit,
                addresses,
                ccAddresses,
                emailAttachments: this.attachments.map(rec => rec.id),
            });
        },
        cancel() {
            this.$emit('cancelEmail');
        },
        addAttachments(files) {
            this.attachments = [...this.attachments, ...files];
            this.disabledWhileActionInProgress = false;
        },
        submittingAttachments() {
            this.disabledWhileActionInProgress = true;
        },
        submittingAttachmentsFinished() {
            this.disabledWhileActionInProgress = false;
        },
        removeAttachment(attachmentId) {
            this.attachments = this.attachments.filter(
                obj => obj.id !== attachmentId,
            );
        },
        downloadAttachment(attachmentUrl) {
            let a = document.createElement('a');
            a.href = attachmentUrl;
            a.download = attachmentUrl.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        validateAndGetEmailAddresses(addressesStr) {
            if (!addressesStr) {
                return [];
            }
            const addresses = addressesStr.split(';').map(e => e.trim());
            const emails = addresses.map(elem => {
                const email = elem.trim();
                if (!email) {
                    return '';
                }

                const RegValidate = /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
                if (!RegValidate.test(email)) {
                    throw new Error(
                        this.$locStr('Email format is not correct'),
                    );
                }
                return email;
            });
            return emails.filter(elem => elem);
        },
        setFocusToEmailText() {
            //TODO - figure out how to focus automaticly (focus method will not work)
            //this.$refs['emailContent'].focus();
        },
    },
    props: {
        emailFormName: {
            type: String,
            required: true,
        },
        emailContent: {
            type: String,
            required: true,
        },
        emailSubject: {
            type: String,
            required: true,
        },
        addresses: {
            type: Array,
            required: true,
        },
        ccaddresses: {
            type: Array,
            required: true,
        },
        contactEmail: {
            type: String,
            required: false,
        },
    },
    watch: {
        addresses(newAddresses) {
            this.clearErrors();
            this.address4Edit = this.getEmailsAsString(newAddresses);
        },
        ccaddresses(newAddresses) {
            this.clearErrors();
            this.ccAddress4Edit = this.getEmailsAsString(newAddresses);
        },
        contactEmail() {
            this.clearErrors();
            this.setFocusToEmailText();
            this.address4Edit = this.getEmailsAsString(this.addresses);
            this.ccAddress4Edit = this.getEmailsAsString(this.ccaddresses);
        },
        emailContent(newContent) {
            this.emailContent4Edit = newContent;
        },
        emailSubject(newSubject) {
            this.emailSubject4Edit = newSubject;
        },
    },
};
</script>

<style>
@import '../assets/css/mangofp.css';
</style>
