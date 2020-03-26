<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card v-if="composingInProgress">
                    <v-card-title>
                        Send email
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text style="height: 300px;">
                        <p><b>Email to: </b>{{ addresses.join(', ') }}</p>
                        <v-textarea
                            name="email-text"
                            no-resize
                            rows="8"
                            dense
                            v-model="emailContent"
                        ></v-textarea>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn
                            color="blue darken-1"
                            outlined
                            @click.native="send"
                        >
                            {{ $locStr('Send') }}
                        </v-btn>
                        <MangoFpAttachment
                            @attachmentsReceived="addAttachments"
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
import MangoFpAttachment from './MangoFpAttachment';
export default {
    name: 'MangoFpEmail',
    components: {
        MangoFpAttachment,
    },
    data() {
        return {
            composingInProgress: false,
            emailContent: '',
            emailSubject: '',
            attachments: [],
        };
    },
    computed: {
        addresses() {
            return [this.details.email];
        },
    },
    methods: {
        clear() {
            this.emailContent = 'no content';
            this.emailSubject = 'dummy';
        },
        send() {
            bus.$emit('EventSendEmail', {
                messageId: this.details.id,
                emailContent: this.emailContent,
                emailSubject: this.emailSubject,
                addresses: this.addresses,
                emailAttachments: this.attachments.map(rec => rec.server_path),
            });
        },
        addAttachments(files) {
            this.attachments = [...this.attachments, ...files];
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
        createNewEmail() {
            this.composingInProgress = true;
        },
        cancelEmail() {
            this.composingInProgress = false;
            this.emailContent = '';
            this.emailSubject = '';
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
<style></style>
