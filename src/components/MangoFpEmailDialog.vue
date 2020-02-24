<template>
    <v-row>
        <v-dialog v-model="dialog" scrollable max-width="600px">
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" tile v-on="on" outlined color="success">
                    <v-icon left>mdi-pencil</v-icon> {{ actionName }}
                </v-btn>
            </template>
            <v-card v-if="content">
                <v-card-title
                    >Send message and set to "{{ actionName }}"
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text style="height: 500px;">
                    <p><b>Email to: </b>{{ addresses.join(', ') }}</p>
                    <v-divider></v-divider>
                    <v-textarea
                        filled
                        name="email-text"
                        label="Email content"
                        no-resize
                        rows="20"
                        v-model="emailContent"
                    ></v-textarea>
                    <v-divider></v-divider>
                </v-card-text>
                <v-card-actions>
                    <v-btn
                        color="blue darken-1"
                        outlined
                        @click.native="confirm"
                    >
                        Confirm
                    </v-btn>
                    <v-btn
                        color="blue darken-1"
                        outlined
                        @click.native="confirmAndSend"
                    >
                        Confirm and send
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-card v-else>
                <v-card-title> Set to "{{ actionName }}"</v-card-title>
                <v-card-text style="height: 500px;">
                    <p>
                        Please confirm, that message will be set to state "{{
                            actionName
                        }}"
                    </p>
                </v-card-text>
                <v-divider></v-divider>
                <v-btn outlined color="success" @click.native="confirm">
                    Confirm
                </v-btn>
            </v-card>
        </v-dialog>
    </v-row>
</template>
<script>
import { bus } from '../main';
export default {
    props: {
        actionName: {
            type: String,
            required: true,
        },
        actionCode: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        label: {
            type: String,
            required: false,
        },
        messageId: {
            type: String,
            required: true,
        },
        content: {
            type: Object,
            required: false,
        },
    },
    methods: {
        init() {
            if (!this.$props.content || !this.$props.content.template) {
                this.emailContent = '';
                return '';
            }

            const shortcodes = ['name', 'label', 'email'];
            var content = this.$props.content.template;

            shortcodes.forEach(element => {
                content = content.replace(
                    new RegExp('<<' + element + '>>', 'g'),
                    this.$props[element],
                );
            });

            this.addresses = [
                this.$props.email,
                ...this.$props.content.addresses,
            ];

            this.emailContent = content;
            //TODO make email subject configurable
            this.emailSubject = 'Email from MangoFP (make this configurable)';
            return content;
        },
        confirmAndSend() {
            this.dialog = false;
            bus.$emit('EventSendEmailAndChangeState', {
                messageId: this.$props.messageId,
                newState: this.$props.actionCode,
                emailContent: this.emailContent,
                emailSubject: this.emailSubject,
                addresses: this.addresses,
            });
        },
        confirm() {
            this.dialog = false;
            bus.$emit('EventMessageStateChanged', {
                messageId: this.$props.messageId,
                newState: this.$props.actionCode,
            });
        },
    },
    data() {
        return {
            dialog: false,
            emailContent: '',
            addresses: [],
        };
    },
    watch: {
        dialog(newValue) {
            if (newValue) {
                this.init();
            }
        },
    },
};
</script>
