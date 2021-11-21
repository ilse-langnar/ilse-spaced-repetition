<template lang="pug" >
.spaced-repetition

    p.is-size-1 Flashcards
    p.is-size-3 335 Cards due today: {{get_today_date()}}

    // VuejsHeatmap( selector="__selector" :entries="entries" :color-range="color_range" )

    button.button.is-active( @click="open_flashcards_modal" ) Start
    button.button( @click="open_flashcards_configuration_modal" ) Configuration
    br

</template>
<script>
// eslint-disable-next-line
const printf                                                    = console.log;

// Plugin
class MyPlugin extends Plugin { constructor() { super() } }

// SVG
    import Plus                     from "./assets/plus.svg"
    import Checks                   from "./assets/checks.svg"
    import Equal                    from "./assets/equal.svg"
    import ArrowRight               from "./assets/arrow-right.svg"
    import Download                 from "./assets/download.svg"
    import Settings                 from "./assets/settings.svg"
    import ChartBar                 from "./assets/chart-bar.svg"
    import Browser                  from "./assets/browser.svg"
    import Card                     from "./assets/card.svg"


// Component
    // import  VuejsHeatmap            from "vuejs-heatmap/src/VuejsHeatmap.vue"
    // import  VuejsHeatmap            from "vuejs-heatmap/src/main.js"
    // printf(  "VuejsHeatmap -> ", VuejsHeatmap )


// export default {
export default {

    name: "SpacedRepetitionHome",

    components: {
        // VuejsHeatmap,
    },

    data() {

        return {
            selector: "__selector",
            entries: [ { "counting": 2070, "created_at": "2018-06-21" }, { "counting": 3493, "created_at": "2018-06-22" } ],
            color_range: ['#c9ecec', '#09b3af'],
            plugin: new MyPlugin(),
        }

    },

    methods: {

        open_flashcards_modal() {

            printf( "this.plugin -> ", this.plugin )
            printf( "this.plugin.classes -> ", this.plugin.classes )
            printf( "this.plugin.classes.Box -> ", this.plugin.classes.Box )
            let box = new this.plugin.classes.Box({
                type: "spaced-repetition"
            })

            // this.plugin.prepend_box(box)
            // this.plugin.open_modal( "spaced-repetition" )

            this.plugin.run_command( "open-spaced-repetition-modal" )
            // this.plugin.run_command( "open-search-files-modal" )
        },

        open_flashcards_configuration_modal() {
            this.plugin.run_command( "open-search-files-modal" )
        },


        get_today_date() {

            let currentDate     = new Date()
            let cDay            = currentDate.getDate();
            let cMonth          = currentDate.getMonth() + 1;
            let cYear           = currentDate.getFullYear();
            return `${cDay}/${cMonth}/${cYear}`
        },

        setup() {

        },

    },

    mounted() {
        this.setup();
    }

}
</script>
<style scoped>

</style>
