<template>
    <v-row>
        <v-dialog v-model="dialog" scrollable max-width="600px">
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" tile v-on="on" outlined color="success">
                    <v-icon left>mdi-pencil</v-icon> {{ label }}
                </v-btn>
            </template>
            <v-card v-if="content">
                <v-card-title
                    >Send message and set to "{{ label }}"
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text style="height: 500px;">
                    <p><b>Email to:</b>{{ content.addresses.join(', ') }}</p>
                    <div v-html="content.template"></div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn color="blue darken-1" text @click.native="confirm">
                        {{ label }}
                    </v-btn>
                    <v-btn
                        color="blue darken-1"
                        text
                        @click.native="confirmAndSend"
                    >
                        Confirm and send
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-card v-else>
                <v-card-title> Set to state {{ label }} </v-card-title>
                <v-divider></v-divider>
                <v-btn color="blue darken-1" text @click.native="confirm">
                    {{ label }}
                </v-btn>
            </v-card>
        </v-dialog>
    </v-row>
</template>
<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        content: {
            type: Object,
            required: false,
        },
    },
    methods: {
        confirmAndSend() {
            console.log('About to confirm and send');
            this.dialog = false;
            //this.$emit('update:dialog', false);
        },
        confirm() {
            console.log('Just confirm');
            this.dialog = false;
            //this.$emit('update:dialog', false);
        },
    },
    data() {
        return {
            dialog: false,
        };
    },
};
</script>
