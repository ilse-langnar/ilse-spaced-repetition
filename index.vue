<template lang="pug" >
.spaced-repetition
    p Spaced Repetition
    p example: {{data}}
</template>
<script>
// eslint-disable-next-line
const printf                                                    = console.log;

export default {

    name: "SpacedRepetitionPluginV1",

    props: {
        data: { type: Object, required: false },
    },

    components: {
    },

    data() {
        return {
        }
    },

    methods: {

        clean() {

        },

        setup() {
        },

    },

    mounted() {
        printf( "this.box -> ", this.box )
        printf( "this.files -> ", this.files )
        printf( "this.$props -> ", this.$props )
        printf( "this -> ", this )
        printf( "this.$data -> ", this.$data )
        this.setup();
    }

}
</script>
<style scoped>

</style>
