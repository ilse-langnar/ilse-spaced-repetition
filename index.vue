<template lang="pug" >
.spaced-repetition-plugin

    // p len: {{today.length}}
    // p len: {{today.length - data.files.length}}

    // p len: {{data.files.length - today.length}}

    // p c :{{cards[pointer]}}
    // p pointer: {{pointer}}
    // button.button( @click="save" ) Save

    .front( v-show="location === 'front' " )
        p.is-size-3(v-if="today && today[pointer]") {{today[pointer]}}
        button.button( @click="flip" ) Reveal( SPC )

    .back( v-show="location === 'back' " )
        p.is-size-3 {{today[pointer]}}
        textarea( ref="textarea" )

        button.button( @click="add_review(5)" ) Very Easy(1)
        button.button( @click="add_review(4)" ) Easy(2)
        button.button( @click="add_review(3)" ) Good(3)
        button.button( @click="add_review(2)" ) Hard(4)
        button.button( @click="add_review(1)" ) Very Hard(2)

    br

</template>
<script>
// eslint-disable-next-line
const printf                                                    = console.log;

// TODO: find a way of getting the time to answer a flashcard

const { supermemo } = require('supermemo')


            /*
            let supermemo_item = {
                interval: review.days_until_next_review,
                repetition: review.reviews.length,
                efactor: this.get_e_factor( review ),
            }
            */


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
        }

    },

    props: {
        plugin: { type: Object, required: false },
    },

    methods: {

        // <-------------------------> Movement <-------------------------> //
        previous() {

            this.$refs.textarea.innerHTML = ""
            this.pointer--

            this.answer_time    = +new Date()
            this.location       = 'front'

            this.save()
        },

        next() {
            this.$refs.textarea.innerHTML = ""
            this.pointer++

            this.answer_time    = +new Date()
            this.location       = 'front'

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
        async flip() {

            if( this.location === 'front' ) {
                this.location = 'back'
                await this.init_editor()
            } else {
                this.location = 'front'
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

            let content = await this.plugin.filesystem.file.get(this.today[this.pointer])
            if( !content )  {
                printf( `ERROR: ${this.today[this.pointer]} is not defined }` )
                this.errors.push( `Error: ${this.today[this.pointer]}'s content is null'` )
                this.next()
            }

            // let content = this.today[this.pointer].content

            this.editor.setValue(content)


            // this.editor.setOption( "lineNumbers", true )
            // this.editor.setOption( "line", false )


        },

        has_one_day_passed() {

            // get today's date. eg: "7/37/2007"
            var date = new Date().toLocaleDateString();

            // if there's a date in localstorage and it's equal to the above: 
            // inferring a day has yet to pass since both dates are equal.
            if( localStorage.yourapp_date == date  ) 
                return false;

            // this portion of logic occurs when a day has passed
            localStorage.yourapp_date = date;

            return true
        },

        decay_all_card_schedules() {

            let schedules   = this.data.schedules
            let keys        = Object.keys(schedules)

            let index = 0
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
