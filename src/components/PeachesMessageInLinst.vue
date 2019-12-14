<template>
    <div>
        <div v-for="item in content" v-bind:key="item.key">
            <strong>{{ item[0] }}:</strong> {{ item[1] }}
        </div>
    </div>
</template>
<script>
export default {
    name: 'PeachesMessageInList',
    props: {
        content: {
            type: Array,
            required: true,
        },
    },
};
</script>
