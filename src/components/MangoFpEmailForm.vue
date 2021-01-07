<template>
    <v-card class="mb-5">
        <v-card-title v-if="emailFormName">
            {{ emailFormName }}
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
        <v-divider></v-divider>
        <v-card-text class="pb-0 pt-0">
            <v-textarea
                ref="emailContent"
                class="emailContent"
                name="email-text"
                rows="12"
                dense
                solo
                v-model="emailContent4Edit"
            ></v-textarea>
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

export default {
    name: 'MangoFpEmailForm',
    components: {
        MangoFpAttachment,
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
                        email + ' ' + this.$locStr('is not proper email'),
                    );
                }
                return email;
            });
            return emails.filter(elem => elem);
        },
        setFocusToEmailText() {
            this.$refs['emailContent'].focus();
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
