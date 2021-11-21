<template lang="pug" >
.review

    .front( v-show="location === 'front' " )

        p.is-size-3.centered-text(v-if="today && today[pointer]" style="margin-top: 22%;") {{today[pointer]}}

        input.input( v-if="is_cloze" v-model="user_cloze_input" @keydown.enter="compare_cloze" ) 
        button.button( v-if="is_cloze" @click="compare_cloze" title="Check" ) Check
        .cloze-final( v-if="cloze_stage === 'final' " )
            p( v-if="is_cloze" ) Distance: {{distance}}
            p {{cloze}}
            Equal( v-if="is_cloze" )
            p {{user_cloze_input}}

        .space

        button.button( @click="flip" ) Reveal( SPC )
        br

    .back( v-show="location === 'back' " )

        // component( v-if="box.id" :is="box.get_component()" :box="box" :key="key" style="border: 1px solid #454545; border-radius: 2px; margin-top: 22%; " )

        #markdown

        .space

        button.review.button.is-danger.is-light( @click="add_review(1)" ) Very Hard(1)
        button.review.button.is-warning.is-light( @click="add_review(2)" ) Hard(2)
        button.review.button.is-light( @click="add_review(3)" ) Good(3)
        button.review.button.is-info.is-light( @click="add_review(4)" ) Easy(4)
        button.review.button.is-success.is-light( @click="add_review(5)" ) Very Easy(5)

        br
        button.skip.button.is-light.is-pulled-right( @click="next" title="Skip card" ) Skip(Return)
        br

    br

</template>
<script>
// eslint-disable-next-line
const printf                        = console.log;

// This is how I get access to the plugin API, Via plugin: new MyPlugin() then use plugin.add_command({ <bla> })
class MyPlugin extends Plugin { constructor() { super() } }


// SVG
    import Equal                    from "./assets/equal.svg"

// Libs
    const { supermemo }             = require('supermemo')
    const marked                    = require('marked')

// Utils/Functions
    import levenshtein              from "./utils/levenshtein.js"
    import shuffle_array            from "./utils/shuffle-array.js"

// Components


export default {

    name: "Review",

    data() {
        return {
            key: 0,
            plugin: new MyPlugin(),

            location: 'front',
            editor: null,
            pointer: 0,
            content: "",

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
        }
    },

    components: {
        Equal,
    },

    computed: {

    },

    methods: {

        open_file( file ) {

            // where to add
            // let focused_column  = this.plugin.get_focused_column()


            // let focused_box = this.plugin.get_focused_box()
            let column = this.plugin.focused.column

            // class
            let Box             = this.plugin.classes.Box

            // instance
            let box             = new Box({
                props: {
                    file: file
                }
            })

            // this.plugin.add_box_to_focused_column( box )
            column.add_box(box)

        },

        // <-------------------------> Test <-------------------------> //
        update() {
            this.key = Math.random() 
        },
        // <-------------------------> Test <-------------------------> //


        // <-------------------------> ??? <-------------------------> //
        set_box() {

            let _this = this
            let file  = this.today[this.pointer]

            let box   = new this.plugin.classes.Box({
                type: "text-editor",
                props: { file: file }
            })

            this.box = box

            this.update()

            let markdown = marked.parse( this.content )
            printf( "markdown -> ", markdown )
            document.getElementById('markdown').innerHTML = markdown

            // setTimeout( () => { _this.box.id = Math.random() }, 1000 )

            return box
        },
        // <-------------------------> ??? <-------------------------> //


        // <-------------------------> Utils <-------------------------> //
        /*
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
        */
        // <-------------------------> Utils <-------------------------> //


        // <-------------------------> Cloze <-------------------------> //
        compare_cloze() {

            let user_input              = this.user_cloze_input

            let cloze_actual_content    = this.content.split("{{c1::")
            let cloze                   = cloze_actual_content[1]

            let normalized_cloze        = cloze.replace( "}}", "" )
                this.cloze                  = normalized_cloze

            let distance = levenshtein( user_input, normalized_cloze )
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
            printf( "set_cards_for_today -> this.data -> ", this.data )
            let cards       = this.data.files
            printf( "cards -> ", cards )

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
                this.today = shuffle_array( this.today )
                printf( "this.today -> ", this.today )

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

        async init() {
            let data = await this.plugin.load()
                this.cards = data.files
            this.set_cards_for_today()
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
<style scoped >

.space {
    height: 100px;
    clear: both;
}

.review {
    margin-left: 10px;

}

.skip {
    margin-top: 10px;
}

</style>
