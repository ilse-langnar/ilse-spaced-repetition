<template lang="pug" >
.spaced-repetition
    br

    .columns
        .column.is-2
            p Sections:

            .configuration-item( :style="get_option_style('review')" @click="select_option('review')" )
                img.img( src="./eye.svg" title="" )
                p Review

            .configuration-item( :style="get_option_style('cards')" @click="select_option('cards')" )
                img.img( src="./card.svg" title="" )
                p Cards

            .configuration-item( :style="get_option_style('scan')" @click="select_option('scan')" )
                img.img( src="./list-search.svg" title="" )
                p Scan

            .configuration-item( :style="get_option_style('schedules')" @click="select_option('schedules')" )
                img.img( src="./calendar-time.svg" title="" )
                p Schedules

            .configuration-item( :style="get_option_style('statistics')" @click="select_option('statistics')"  )
                img.img( src="./chart-bar.svg" title="" )
                p Statistics

            .configuration-item( :style="get_option_style('knowledge-tree')" @click="select_option('knowledge-tree')" )
                img.img( src="@/assets/images/git-tree.svg" title="" )
                p Knowledge Tree

        .column.is-10

            .option( v-if="selected_option === 'review' " )
                index( :plugin="plugin" :box="box" )

            .option( v-if="selected_option === 'cards' " )
                p.is-size-1 Cards
                .loop( v-for="( card, index ) in cards" :key="index" )
                    p card: {{card}}


</template>
<script>
// eslint-disable-next-line
const printf                        = console.log;


import index from "./index.vue"

export default {

    name: "SpacedRepetitionPlugin",

    data() {
        return {
            selected_option: "review",
            cards: [],
        }
    },

    props: {
        plugin: { type: Object, required: false },
        box: { type: Object, required: false },
    },

    components: {
        index,
    },

    computed: {

    },

    methods: {


        // <---------------------> Selecting <---------------------> //
        select_option( option ) {
            this.selected_option = option
        },

        get_option_style( option ) {
            let style = ``

            if( this.selected_option === option ) {
                style += 'background: #e9e9e9;'
            }

            return style

        },
        // <---------------------> Selecting <---------------------> //

        async init() {
            let data = await this.plugin.load()
            printf( "typeof data -> ", typeof data )
            printf( "data -> ", data )
            this.cards = data.files

        },

        setup() {
            this.init()
        },

    },

    mounted() {
        this.setup();
    }

}
</script>
<style src="@/assets/css/style.css"></style>
