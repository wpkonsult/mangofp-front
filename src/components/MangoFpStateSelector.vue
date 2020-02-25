<template>
    <v-row>
        <v-select
            :class="{ 'margin-left': '-180px' }"
            :items="actions"
            label="Vali tegevus"
            @change="actionSelected"
        >
        </v-select>
        <v-dialog v-model="emailDialog" scrollable max-width="600px">
            <v-card v-if="emailContent">
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
export default {
    name: 'MangoFpStateSelector',
    data() {
        return {
            emailDialog: false,
            emailContent: '',
            addresses: [],
            actionName: '',
        };
    },
    methods: {
        actionSelected(value) {
            console.log('Action changed: ' + value);
            const shortcodes = ['name', 'label', 'email'];
            let content = '';
            console.log(
                'emailTemplates: ' + JSON.stringify(this.emailTemplates[value]),
            );
            if (value in this.emailTemplates) {
                content = this.emailTemplates[value].template;
            }
            shortcodes.forEach(element => {
                content = content.replace(
                    new RegExp('<<' + element + '>>', 'g'),
                    this.details[element],
                );
            });

            this.emailContent = content;
            this.emailDialog = true;
            this.actionName = this.statuses[this.selectedTab].action;
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
};
</script>

<style></style>
