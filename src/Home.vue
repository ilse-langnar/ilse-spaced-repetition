<template lang="pug" >
.spaced-repetition

    p.is-size-1 Flashcards
    p.is-size-3 335 Cards due today: {{get_today_date()}}

    button.button.is-active( @click="open_flashcards_modal" ) Start
    button.button( @click="open_flashcards_configuration_modal" ) Configuration
    br
    // button.button Open here

    // .spaced-repetition

        Download.import.is-pulled-left( title="Import Decks" )
        .options
            // Decks/add/browser
            Card
            Plus
            Browser

        // hr

        .main
            p.is-size-1 Decks


        .columns( v-if="decks.length" )
            .column.is-8

            .column.is-1
                p.is-size-5.has-text-weight-bold Due
            .column.is-1
                p.is-size-5.has-text-weight-bold New
            .column.is-1
                p.is-size-5.has-text-weight-bold Total

        .deck( v-for="( deck, index ) in decks" :key="index" style="height: 60px; border: 1px solid #aaa; border-radius: 6px; margin-bottom: 10px; " )

            .columns
                .column.is-8
                    p.is-size-5 {{deck.name}}

                // Due
                .column.is-1
                    p.is-size-4 2

                // New
                .column.is-1
                    p.is-size-4 10

                // Total
                .column.is-1
                    p.is-size-4 10

                .column.is-1
                    Settings.is-pulled-right.setting( title="Deck Settings" )

        .no-deck( v-if="!decks.length" style="margin: 0 auto;")
            p.is-size-2.has-text-centered You don't have any decks.


        br
        .clear
        button.button( @click="add_new_deck" ) Create Deck
        ChartBar



    // .front( v-show="location === 'front' " )

        p.is-size-3.centered-text(v-if="today && today[pointer]" ) {{today[pointer]}}

        .clear
        button.button( @click="flip" ) Reveal( SPC )
        Plus( style="width: 40px; cursor: pointer; border: 1px solid #aaa; border-radius: 10px; " @click="open_file(today[pointer])" title="Open file" )

        // p {{today[pointer]}}
        input.input( v-if="is_cloze" v-model="user_cloze_input" @keydown.enter="compare_cloze" ) 
        Checks( v-if="is_cloze" style="width: 40px; cursor: pointer; border: 1px solid #aaa; border-radius: 10px; " @click="compare_cloze" title="Check" )
        .cloze-final( v-if="cloze_stage === 'final' " )
            p( v-if="is_cloze" ) Distance: {{distance}}
            p {{cloze}}
            Equal( v-if="is_cloze" )
            p {{user_cloze_input}}

    .back( v-show="location === 'back' " )
        p.is-size-3.centered-text {{today[pointer]}}

        // component( v-if="box.id && box.get_component()" :is="box.get_component()" :box="box" :key="today[pointer]" )
        // component( v-show="box.id" :is="box.get_component()" :box="box" :key="box.id" )

        button.button( @click="add_review(1)" ) Very Hard(1)
        button.button( @click="add_review(2)" ) Hard(2)
        button.button( @click="add_review(3)" ) Good(3)
        button.button( @click="add_review(4)" ) Easy(4)
        button.button( @click="add_review(5)" ) Very Easy(5)

        br

        br
        ArrowRight( style="width: 40px; cursor: pointer; border: 1px solid #aaa; border-radius: 10px; " @click="next" title="Skip" )
        br
        // button.button( @click="next" ) Skip
        // button.button( @click="test" ) test

    br

</template>
<script>
// eslint-disable-next-line
const printf                                                    = console.log;

// Plugin
class MyPlugin extends Plugin {

    constructor() {
        super()
    }

}

// Utils
    import shuffle_array            from "./shuffle-array.js"

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

// Libs
    const { supermemo } = require('supermemo')


// export default {
export default {

    name: "SpacedRepetitionHome",

    components: {
        Plus,
        Checks,
        Equal,
        ArrowRight,
        Download,
        Settings,
        ChartBar,
        Browser,
        Card,
    },

    data() {

        return {
            decks: [],

            plugin: new MyPlugin(),

            location: 'front',

            editor: null,
            pointer: 0,
            content: "",

            errors: [],

            answer_time: +new Date(),

            today: [],

            data: {},

            // Cloze
            is_cloze: false,
            user_cloze_input: "",
            cloze: "",
            distance: -1,
            cloze_stage: "init",
            box: {},

            focused_box: {},
        }

    },

    // props: {
        // plugin: { type: Object, required: false },
    // },

    methods: {

        open_flashcards_modal() {

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

        add_new_deck() {

            this.decks.push({
                name: Math.random().toString()
            })

        },

        open_file( file ) {

            // where to add
            // let focused_column  = this.plugin.get_focused_column()


            // let focused_box = this.plugin.get_focused_box()
            let column = this.plugin.focused.column
            // printf( "focused_box -> ", focused_box )

            // class
            let Box             = this.plugin.classes.Box

            // instance
            let box             = new Box({
                props: {
                    file: file
                }
            })

            // focused_box.set_file( file )

            // this.plugin.add_box_to_focused_column( box )
            column.add_box(box)

        },

        // <-------------------------> Test <-------------------------> //
        test() {
            this.box.id = Math.random()
        },
        // <-------------------------> Test <-------------------------> //


        // <-------------------------> ??? <-------------------------> //
        set_box() {

            let _this = this
            let file  = this.today[this.pointer]

            let box   = new this.plugin.classes.Box({ type: "text-editor", props: { file: file  }})
                this.box = box
            this.plugin.focus_on_box( box )

            // setTimeout( () => { _this.box.id = Math.random() }, 1000 )
            this.test()

            return box
        },
        // <-------------------------> ??? <-------------------------> //


        // <-------------------------> Utils <-------------------------> //
        levenshtein( str1 = '', str2 = '' ) {

             const track = Array(str2.length + 1).fill(null).map(() =>
                     Array(str1.length + 1).fill(null));
             for (let i = 0; i <= str1.length; i += 1) {
                 track[0][i] = i;

             }
             for (let j = 0; j <= str2.length; j += 1) {
                 track[j][0] = j;

             }
             for (let j = 1; j <= str2.length; j += 1) {
                 for (let i = 1; i <= str1.length; i += 1) {
                     const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                     track[j][i] = Math.min(
                             track[j][i - 1] + 1, // deletion
                             track[j - 1][i] + 1, // insertion
                             track[j - 1][i - 1] + indicator, // substitution

                             );

                 }

             }
             return track[str2.length][str1.length];

        },
        // <-------------------------> Utils <-------------------------> //


        // <-------------------------> Cloze <-------------------------> //
        compare_cloze() {

            let user_input              = this.user_cloze_input

            let cloze_actual_content    = this.content.split("{{c1::")
            let cloze                   = cloze_actual_content[1]

            let normalized_cloze        = cloze.replace( "}}", "" )
                this.cloze                  = normalized_cloze

            let distance = this.levenshtein( user_input, normalized_cloze )
                this.distance = distance

            this.cloze_stage = "final"

        },

        check_is_cloze( content ) {

            if( !content ) return 
            if( !content.indexOf ) return

            if( content.indexOf("{{c1::") !== -1 )  {
                this.is_cloze = true
                this.plugin.set_mode("Insert")
            }

        },
        // <-------------------------> Cloze <-------------------------> //


        // <-------------------------> Movement <-------------------------> //
        previous() {

            // this.$refs.textarea.innerHTML = ""
            this.pointer--

            this.answer_time    = +new Date()
            this.location       = 'front'

            this.save()
        },

        async next() {

            // Reset + Update
                this.pointer++
                this.answer_time    = +new Date()
                this.location       = 'front'

            // Is Cloze?
                this.content = await this.plugin.filesystem.file.get(this.today[this.pointer])
                this.check_is_cloze( this.content )

            // Cloze
                this.user_cloze_input   = ""
                this.cloze_stage        = "init"
                this.is_cloze           = false
                this.cloze              = ""

            // BUGFIX: Update the content of the note, and don't stick with the last one
                this.set_box()

            this.save()
        },
        // <-------------------------> Movement <-------------------------> //


        // <-------------------------> Saving <-------------------------> //
        async save() {

            let data = this.data
            await this.plugin.save( data, true )

            this.plugin.Messager.emit( "status-line", "set", "Saved Spaced repetition schedules" )

        },
        // <-------------------------> Saving <-------------------------> //


        // <-------------------------> Schedule <-------------------------> //
        get_card_schedule( card ) {

            if( this.data.schedules[card] ) {
                return this.data.schedules[card]
            } else {
                return null
            }

        },

        add_schedule( card, supermemo_item ) {

            let schedule = this.get_card_schedule( card )

            this.data.schedules[card] =  {

                reviews: [],
                supermemo_item: supermemo_item,

                answer_time: supermemo_item.answer_time,
                date: +new Date(), // Get Unix Epoch Hack

                interval: supermemo_item.interval,
                repetition: supermemo_item.repetition,
                efactor: supermemo_item.efactor,
            }

            this.data.schedules[card].reviews.push(supermemo_item)

        },
        // <-------------------------> Schedule <-------------------------> //


        // <-------------------------> Review Card <-------------------------> //
        add_review( grade ) {

            let card     = this.today[this.pointer]
            let schedule = this.get_card_schedule(card)

            let supermemo_item

            if( !schedule ) {

                supermemo_item = {
                    interval: 1,
                    repetition: 1,
                    efactor: 2.5,
                }

            } else {

                supermemo_item = {
                    interval: schedule.interval,
                    repetition: schedule.reviews.length || 1,
                    efactor: schedule.efactor,
                }

            }


            let result = supermemo(supermemo_item, grade)
                result.answer_time = new Date().getTime() - this.answer_time // For Statistics

            this.add_schedule( card, result )
            this.next()

        },
        // <-------------------------> Review Card <-------------------------> //


        // <-------------------------> Card <-------------------------> //
        reveal_front() {
            this.set_box()
            this.location = 'front'
        },

        reveal_back() {
            this.location = 'back'
        },

        flip() {

            if( this.location === 'front' ) {
                this.reveal_back()
            } else {
                this.reveal_front()
            }

        },
        // <-------------------------> Card <-------------------------> //


        // <-------------------------> Today's Card <-------------------------> //
        async set_cards_for_today() {

            this.data       = await this.plugin.load()
            let cards       = this.data.files

            // UI
                this.plugin.Messager.emit( "status-line", "set", "Getting today's flashcards ..." )

            let schedule
            for( let card of cards ) {

                schedule = this.get_card_schedule(card)
                if( !schedule ) this.today.push(card)
                if( schedule && schedule.interval <= 2 ) this.today.push(card)

                /*
                // schedule = this.get_card_schedule(card)
                if( !schedule ) {
                    this.today.push(card)

                } else {

                    if( schedule.interval >= 2 ) continue
                    this.today.push(card)

                }
                */

            }

            // RANDOM
                this.today = shuffle_array(this.today)

            // Is Cloze
                this.content = await this.plugin.filesystem.file.get(this.today[this.pointer])
                this.check_is_cloze( this.content )

            this.set_box()
            // setTimeout( () => { this.decay_cards_today() }, 2000 )


            // UI
                this.plugin.Messager.emit( "status-line", "set", "Getting today's flashcards: DONE" )
        },
        // <-------------------------> Today's Card <-------------------------> //

        // previous() {
            // this.pointer--
        // },

        decay_all_card_schedules() {

            let schedules   = this.data.schedules
            let keys        = Object.keys(schedules)

            let index       = 0
            let key
            let current_schedule

            for( const schedule of Object.values(schedules) ) {
                index++
                key = keys[index]
                if( !key ) continue
                current_schedule = schedules[key]


                if( this.data.schedules[key].interval >= 1 ) {
                    this.data.schedules[key].interval--
                }

            }
            this.save()

        },

        get_last_decay_date()  {

            let decay_history   = this.data.decay_history
            let last_decay

            if( decay_history.length === 0 ) {
                return null

            } else {
                last_decay      = decay_history[decay_history.length -1]
                return last_decay
            }

            return last_decay

        },

        async decay_cards_today() {

            let last_decay = this.get_last_decay_date()
            var today_date = new Date().toLocaleDateString();

            if( last_decay === today_date ) {
                // Already decayed today
            } else {
                this.decay_all_card_schedules()
                this.data.decay_history.push( today_date )
            }

            await this.save()

        },

        setup() {

            /*
            this.plugin.Messager.on( "~plugin", (action, payload) => {
                if( action === "focus-on-box" ) {
                    printf( "@@@focus-on-box -> payload -> ", payload )
                    this.focused_box = payload
                }

            })

            this.set_cards_for_today()
            setTimeout( () => { this.decay_cards_today() }, 2000 )
            */
        },

    },

    mounted() {
        this.setup();
    }

}
</script>
<style scoped>

.clear {
    clear: both;
    height: 20px;

}

.centered-text {
    text-align: center;
    width: 100%;
}

.spaced-repetition {
    cursor: alias;
    width: 99%;
}

.spaced-repetition .import {
    margin-left: 10px;
}


.setting {
    cursor: pointer;
}

</style>
