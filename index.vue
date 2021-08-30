<template lang="pug" >
.spaced-repetition-plugin

    .front( v-show="location === 'front' " )
        p.is-size-3(v-if="today && today[pointer]") {{today[pointer]}}

        button.button( @click="flip" ) Reveal( SPC )


        input.input( v-if="is_cloze" v-model="user_cloze_input" ) 
        button.button( v-if="is_cloze" @click="compare_cloze" @keydown.enter="compare_cloze" ) Check
        .cloze-final( v-if="cloze_stage === 'final' " )
            p( v-if="is_cloze" ) Distance: {{distance}}
            p {{cloze}}
            img.img( v-if="is_cloze" src="@/assets/images/equal.svg" )
            p {{user_cloze_input}}

    .back( v-show="location === 'back' " )
        p.is-size-3 {{today[pointer]}}

        component( v-if="box.id && box.get_component()" :is="box.get_component()" :box="box" :key="box.id" )

        // textarea( ref="textarea" )

        button.button( @click="add_review(5)" ) Very Easy(1)
        button.button( @click="add_review(4)" ) Easy(2)
        button.button( @click="add_review(3)" ) Good(3)
        button.button( @click="add_review(2)" ) Hard(4)
        button.button( @click="add_review(1)" ) Very Hard(2)

        br
        br

        button.button( @click="next" ) Skip

    br

</template>
<script>
// eslint-disable-next-line
const printf                                                    = console.log;

const { supermemo } = require('supermemo')

export default {

    name: "SpacedRepetitionPluginV1",

    data() {
        return {

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
        }

    },

    props: {
        plugin: { type: Object, required: false },
    },

    methods: {

        set_box() {

            let _this = this
            let file  = this.today[this.pointer]

            let box   = new this.plugin.classes.Box({ type: "text-editor", props: { file: file  }})
                this.box = box

            setTimeout( () => { _this.box.id = Math.random() }, 1000 )

            return box
        },


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
                let _this = this
                setTimeout( () => { _this.box.id = Math.random() }, 1000 )

            this.save()
        },
        // <-------------------------> Movement <-------------------------> //


        // <-------------------------> Utils <-------------------------> //
        get_card_schedule( card ) {

            if( this.data.schedules[card] ) {
                return this.data.schedules[card]
            } else {
                return null
            }

        },
        // <-------------------------> Utils <-------------------------> //


        // <-------------------------> Saving <-------------------------> //
        async save() {

            let data = this.data
            await this.plugin.save( data, true )

            this.plugin.Messager.emit( "status-line", "set", "Saved Spaced repetition schedules" )

        },
        // <-------------------------> Saving <-------------------------> //


        // <-------------------------> Schedule <-------------------------> //
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
            this.location = 'front'
        },

        reveal_back() {
            this.location = 'back'
            // await this.init_editor()
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
            this.today = this.shuffle_array(this.today)

            this.content = await this.plugin.filesystem.file.get(this.today[this.pointer])
            this.check_is_cloze( this.content )

            this.set_box()

            // UI
                this.plugin.Messager.emit( "status-line", "set", "Getting today's flashcards: DONE" )
        },
        // <-------------------------> Today's Card <-------------------------> //

        // previous() {
            // this.pointer--
        // },

        shuffle_array(array) {
            let curId = array.length;
            // There remain elements to shuffle
            while (0 !== curId) {
                // Pick a remaining element
                let randId = Math.floor(Math.random() * curId);
                curId -= 1;
                // Swap it with the current element.
                let tmp = array[curId];
                array[curId] = array[randId];
                array[randId] = tmp;

            }
            return array;

        },

        async init_editor() {

             let HyperMD     = require('hypermd')
             var textarea    = this.$refs.textarea
         
             if( this.editor ) {
                 this.editor.toTextArea()

             }
             this.editor      = HyperMD.fromTextArea( textarea, {
     
                baseURI: "",

                hmdInsertFile: {
                    byPaste: true,
                    byDrop: true, 
                }
             

             })
             let t = new this.plugin.TextEditor( this.editor, {

                 props: {
                     file: this.today[this.pointer]
                 },
             })

            // this.editor.setOption( "tabSize", this.tab_size )
            // this.editor.setOption( "indentUnit", this.indent_unit )
            // this.editor.setOption( "indentWithTabs", this.indent_with_tabs )

            this.editor.setOption( "mode", "emacs" )
            this.editor.setOption( "styleActiveLine", this.style_active_line )
            this.editor.setSize( "100%", "100%" )

            this.editor.setOption( "mode", "text/markdown" )

            // require( "codemirror/theme/monokai.css" )
            this.editor.setOption( "theme", "monokai" )

            if( !this.today[this.pointer] ) {
                this.editor.setValue("ERROR")
                return
            }

            this.content = await this.plugin.filesystem.file.get(this.today[this.pointer])
            if( !this.content )  {
                printf( `ERROR: ${this.today[this.pointer]} is not defined }` )
                this.errors.push( `Error: ${this.today[this.pointer]}'s content is null'` )
                this.next()
            }

            this.editor.setValue(this.content)


            // this.editor.setOption( "lineNumbers", true )
            // this.editor.setOption( "line", false )


        },

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

            printf( "this.data -> ", this.data )
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
                printf( "Already decayed today" )
            } else {
                printf( "NOT decayed today" )
                this.decay_all_card_schedules()
                this.data.decay_history.push( today_date )
            }

            await this.save()

        },

        setup() {
            this.set_cards_for_today()
            setTimeout( () => { this.decay_cards_today() }, 2000 )
        },

    },

    mounted() {
        this.setup();
    }

}
</script>
<style scoped>

.spaced-repetition-plugin {
    height: 400px;
    overflow: auto;
}

.Codemirror {
    font-family: 'Inter', sans;
}

</style>
