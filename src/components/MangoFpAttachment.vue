<template>
    <div class="container">
        <div class="large-12 medium-12 small-12 cell">
            <input
                if
                type="file"
                id="file"
                ref="files"
                multiple
                v-on:change="handleFileUpload()"
            />

            <v-progress-circular
                v-if="uploadPercentage"
                :rotate="-90"
                :size="40"
                :width="5"
                :value="uploadPercentage"
                color="primary"
            >
                {{ uploadPercentage }}
            </v-progress-circular>
            <v-icon v-else large color="blue darken-2" @click="attachFile">
                mdi-paperclip
            </v-icon>
        </div>
    </div>
</template>
<script>
/*globals MANGOFP_RESOURCES:false */
import axios from 'axios';
import { bus } from '../main';

export default {
    data() {
        return {
            uploadPercentage: 0,
        };
    },
    methods: {
        attachFile() {
            this.$refs.files.click();
        },
        handleFileUpload() {
            this.files = this.$refs.files.files;
            this.submitFile();
        },
        submitFile() {
            let formData = new FormData();
            this.$emit('submittingAttachments');
            for (var i = 0; i < this.files.length; i++) {
                let file = this.files[i];

                formData.append('files[' + i + ']', file);
            }
            this.uploadPercentage = 2;
            const onUploadProgress = progressEvent => {
                this.uploadPercentage = parseInt(
                    Math.round(
                        (progressEvent.loaded / progressEvent.total) * 100,
                    ) - 1,
                );
            };
            axios
                .post(
                    MANGOFP_RESOURCES['adminUrl'] + '/attachments',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        onUploadProgress,
                    },
                )
                .then(result => {
                    this.uploadPercentage = 0;
                    this.$emit('attachmentsReceived', result.data.payload);
                    return true;
                })
                .catch(e => {
                    bus.$emit('ErrorConnection', {
                        error: e.message || 'Uploading attachments failed',
                    });
                    this.uploadPercentage = 0;
                    this.$emit('submittingAttachmentsFinished');
                });
        },
    },
    props: {},
};
</script>
<style scoped>
input[type='file'] {
    display: none;
}
</style>
