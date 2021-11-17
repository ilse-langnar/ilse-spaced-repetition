<template lang="pug" >
.spaced-repetition.ilse-modal
    br

    .columns
        .column.is-2.sections

            .item( :style="get_option_style('review')" @click="select_option('review')" )
                Eye
                p Review

            .item( :style="get_option_style('cards')" @click="select_option('cards')" )
                Card
                p Cards

            .item( :style="get_option_style('scan')" @click="select_option('scan')" )
                ListSearch
                p Scan

            .item( :style="get_option_style('schedules')" @click="select_option('schedules')" )
                CalendarTime
                p Schedules

            .item( :style="get_option_style('statistics')" @click="select_option('statistics')"  )
                ChartBar
                p Statistics

            .item( :style="get_option_style('knowledge-tree')" @click="select_option('knowledge-tree')" )
                GitTree
                p Knowledge Tree

        .column.is-10

            .option( v-if="selected_option === 'review' " )
                Review

            .option( v-if="selected_option === 'cards' " )
                p.is-size-1 Cards
                .loop( v-for="( card, index ) in cards" :key="index" )
                    p card: {{card}}


</template>
<script>
// eslint-disable-next-line
const printf                        = console.log;

class MyPlugin extends Plugin {

    constructor() {
        super()
    }

}

// Components
    import Review           from "./Review.vue"

// SVG 
    import Eye              from "./assets/eye.svg"
    import Card             from "./assets/card.svg"
    import ListSearch       from "./assets/list-search.svg"
    import CalendarTime     from "./assets/calendar-time.svg"
    import ChartBar         from "./assets/chart-bar.svg"
    import GitTree          from "./assets/git-tree.svg"

export default {

    name: "SpacedRepetitionPluginReview",

    data() {
        return {
            plugin: new MyPlugin(),
            selected_option: "review",
            cards: [],
        }
    },

    components: {
        Review,
        Eye,
        Card,
        ListSearch,
        CalendarTime,
        ChartBar,
        GitTree,
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
            this.cards = data.files

        },

        setup() {
            // this.init()
        },

    },

    mounted() {
        this.setup();
    }

}
</script>
<style>

</style>
