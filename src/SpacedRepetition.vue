<template lang="pug" >
.spaced-repetition.ilse-modal
    br

    .columns
        .column.is-2.sections

            .item( :style="get_option_style('review')" @click="select_option('review')" )
                Eye
                p Review

            .item( :style="get_option_style('files')" @click="select_option('files')" )
                Card
                p Files

            .item( :style="get_option_style('decks')" @click="select_option('decks')" )
                Card
                p Decks

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

            .option( v-if="selected_option === 'files' " )
                p.is-size-1 Files( cards )
                .loop( v-for="( card, index ) in data.files" :key="index" )
                    p.item {{card}}

            .option( v-if="selected_option === 'decks' " )
                p.is-size-1 Decks

            .option( v-if="selected_option === 'scan' " )
                p.is-size-1 Scan
                p.is-size-5 What tag marks you flashcards?( e.g #flashcard, #leitner-box, #spaced-repetition ) 

                select( v-model="scan_tag" )
                    option( v-for="( tag, index ) in Object.keys(plugin.tags)" :value="tag" ) {{tag}}
                br
                button.button( v-if="scan_tag" @click="run_scanner" ) import files
                .importing-files
                    .loop( v-for="( file, index ) in scan_queue" :key="index" )
                        p {{file}} OK


            .option( v-if="selected_option === 'schedules' " )
                p.is-size-1 Schedules
                p Keys:: {{Object.keys(data)}}
                p Schedules:: {{data.schedules}}

            .option( v-if="selected_option === 'statistics' " )
                p.is-size-1 Statistics

            .option( v-if="selected_option === 'knowledge-tree' " )
                p.is-size-1 Knowledge Tree
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

    name: "SpacedRepetitionPlugin",

    data() {
        return {
            scan_tag: "",
            scan_queue: [],
            cards: [],

            data: {},
            plugin: new MyPlugin(),
            selected_option: "review",
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

        // TODO: move this to Scanner.vue
        run_scanner() {

            let tags = this.plugin.tags[this.scan_tag]

            for( const tag of tags ) {
                this.scan_queue.push( tag )
            }

            let data = {
                files: this.scan_queue,
                schedules: [],
                decay_history: [],
            }

            this.plugin.save( data, true )

        },

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
            this.data = await this.plugin.load()
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
<style>

</style>
