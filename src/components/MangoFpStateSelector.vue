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
        <v-row>
            <v-col>
                <v-card v-if="emailContent">
                    <v-card-title>
                        {{ actionName }}
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
                            @click.native="confirm"
                        >
                            {{ $locStr('Confirm') }}
                        </v-btn>
                        <v-btn
                            color="blue darken-1"
                            outlined
                            @click.native="confirmAndSend"
                        >
                            {{ $locStr('Confirm and send') }}
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
                    <v-card-title>{{ actionName }}</v-card-title>
                    <v-card-text style="height: 100px;">
                        <p>
                            Please confirm, that message will be set to state
                            "{{ actionName }}"
                        </p>
                    </v-card-text>
                    <v-btn outlined color="success" @click.native="confirm">
                        {{ $locStr('Confirm') }}
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { bus } from '../main';
import MangoFpAttachment from './MangoFpAttachment';

export default {
    name: 'MangoFpStateSelector',
    components: {
        MangoFpAttachment,
    },
    data() {
        return {
            emailContent: '',
            emailSubject: '',
            addresses: [],
            actionName: '',
            actionObj: { value: '', text: '' },
            attachments: [],
        };
    },
    methods: {
        clear() {
            this.emailContent = '';
            this.addresses = [];
            this.actionName = '';
            this.emailSubject = '';
            this.actionObj = { value: '', text: '' };
        },
        actionSelected(value) {
            const shortcodes = ['name', 'label', 'email', 'note'];
            let content = '';
            if (value in this.emailTemplates) {
                content = this.emailTemplates[value].template;
                this.addresses = [
                    this.details.email,
                    ...this.emailTemplates[value].addresses,
                ];
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
        confirmAndSend() {
            this.dialog = false;
            bus.$emit('EventSendEmailAndChangeState', {
                messageId: this.details.id,
                newState: this.actionObj.value,
                emailContent: this.emailContent,
                emailSubject: this.emailSubject,
                addresses: this.addresses,
                emailAttachments: this.attachments.map(rec => rec.server_path),
            });
        },
        confirm() {
            this.dialog = false;
            bus.$emit('EventMessageStateChanged', {
                messageId: this.details.id,
                newState: this.actionObj.value,
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

<style></style>
