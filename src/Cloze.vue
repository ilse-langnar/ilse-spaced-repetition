<template lang="pug" >
.cloze( v-if="is_on" )

    // input.input(   v-if="is_on && cloze_stage === 'init'" v-model="user_cloze_input" @keydown.enter="compare_cloze" autofocus ref="cloze_input" ) 
    // button.button( v-if="is_on && cloze_stage === 'init'" @click="compare_cloze" title="Check" ) Check

    input.input(   v-model="user_cloze_input" @keydown.enter="compare_cloze" autofocus ref="cloze_input" ) 
    button.button( @click="compare_cloze" title="Check" ) Check

    br

    .cloze-final( v-if="cloze_stage === 'final' " )

        br
        br

        .columns( style="width: 100% !important;" )
            .column.is-6
                p.is-size-6 Your Answer
                p.is-size-4 {{user_cloze_input}}
            .column.is-5
                p.is-size-6 Correct Answer
                p.is-size-4 {{cloze}}


        .tag.is-large( :class="get_distance_class(distance)" ) Distance: {{distance}} {{get_distance_message(distance)}}
        br

</template>
<script>
// eslint-disable-next-line
const printf                        = console.log;

// This is how I get access to the plugin API, Via plugin: new MyPlugin() then use plugin.add_command({ <bla> })
class MyPlugin extends Plugin { constructor() { super() } }


// SVG
    import Equal                    from "./assets/equal.svg"

// Utils/Functions
    import levenshtein              from "./utils/levenshtein.js"

export default {

    name: "Cloze",

    data() {
        return {
            is_on: false,
            user_cloze_input: "",
            cloze: "",
            distance: -1,
            cloze_stage: "init",
        }
    },

    components: {
        Equal,
    },

    props: {
        content: { type: String, required: false, }
    },

    watch: {

        content( content ) {
            this.is_on = this.is_cloze( content )
            if( !this.is_on ) this.reset()
            if( this.is_on ) {
                setTimeout( () => { this.$refs.cloze_input.focus() }, 100 )
            }
        },

    },

    methods: {

        get_distance_message( distance ) {

            if( distance <= 2 ) {
                return "100%"
            } else if( distance <= 6 ) {
                return "Good"
            } else if( distance <= 10 ) {
                return "Bad"
            } else if( distance <= 20 ) {
                return "Bad"
            } else if( distance <= 30 ) {
                return "Horrible"
            } else {
                return "Bruh"
            }

        },

        get_distance_class( distance ) {

            if( distance <= 2 ) {
                return "is-success"
            } else if( distance <= 6 ) {
                return "is-info"
            } else if( distance <= 10 ) {
                return "is-light"
            } else if( distance <= 20 ) {
                return "is-warning"
            } else if( distance <= 30 ) {
                return "is-danger"
            } else {
                return "is-danger"
            }

        },

        // <-------------------------> Cloze <-------------------------> //
        compare_cloze() {

            let user_input              = this.user_cloze_input

            let cloze_actual_content    = this.content.split("{{c1::")
            let cloze                   = cloze_actual_content[1]

            let normalized_cloze        = cloze.replace( "}}", "" )
                this.cloze              = normalized_cloze

            let distance                = levenshtein( user_input, normalized_cloze )
                this.distance           = distance

            this.cloze_stage            = "final"

            this.$emit( "check" )

        },

        is_cloze( content ) {

            if( !content ) return false
            if( !content.indexOf ) return false

            let has_cloze = content.indexOf("{{c1::") !== -1 

            if( has_cloze ) {
                return true
            }

        },

        reset() {
            this.user_cloze_input   = ""
            this.cloze              = ""
            this.distance           = -1
            this.cloze_stage        = "init"
        },

        // <-------------------------> Cloze <-------------------------> //

        setup() {
        },

    },

    mounted() {
        this.setup();
    }

}
</script>
<style scoped >

</style>
