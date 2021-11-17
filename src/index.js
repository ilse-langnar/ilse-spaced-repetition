


class SpacedRepetition extends Plugin {

    constructor(  ) {

        super()

        const printf   = console.log
        const TAG_NAME = "#leitner-box"
        this.setup()
        // this.init()

        // this.setup()
    }

    setup() {

        let _this                    = this

        let home        = this.add_box({
            id: "spaced-repetition-home",
            name: "Spaced Repetition Home",
            type: "vue",
            component: require("./Home.vue"),
            props: {}
        })

        let spaced_repetition = this.add_box({
            id: "spaced-repetition",
            name: "Spaced Repetition",
            type: "vue",
            component: require("./SpacedRepetition.vue"),
            props: {}
        })

        let spaced_repetition_review = this.add_box({
            id: "spaced-repetition-review",
            name: "Spaced Repetition Review",
            type: "vue",
            component: require("./Review.vue"),
            props: {}
        })

        let modal = this.add_modal({
            id: "spaced-repetition",
            name: "Spaced Repetition",
            box: spaced_repetition,
            props: {
                box: {},
                modal: {
                    height: "80%",
                    width: "70%",
                    style: "border-radius: 10px;",
                    scrollable: false
                }
            }

        })

        this.add_command({
            id: "open-spaced-repetition-modal",
            name: "Open spaced repetition modal",
            description: "Will open the spaced repetition plugin modal",
            fn: function() {
                _this.Messager.emit( "modals.vue", "open", { target: "spaced-repetition" })
            },

        })

        // api.add_key( "S", "Normal", "", "open-spaced-repetition-modal", true )


        // api.add_menu_item( "spaced-repetition", api.require("./calendar-time.svg"), "Open Spaced Repetition Modal", "open-spaced-repetition-modal", false )

        this.add_popover({
            id: "spaced-repetition-main",
            name: "Spacec Repetition Main",
            width: 300,
            position: "top",
            activation_event: "click",
            box_type: home
        })

        // option 1 make 'img'
        this.add_plugin_menu_item({
            id: "spaced-repetition",
            name: "Spaced Repetition",
            popover: {
                id: "spaced-repetition-main",
                position: "top",
            },
            img: "calendar-time.svg",
            description: "Open Spaced Repetition Modal",
            command: "",
            has_space: false
        })

    }


    // <--------------------> Init <-------------------->  //
        async init() {
            await this.add_flashcards()

            let component = await require("./Home.vue")

            /*
            this.api.add_box( "spaced-repetition-plugin", component, {
                files: this.data || [],
                example: "OLOLOL"
            })
            */

        }
    // <--------------------> Init <-------------------->  //

    // <--------------------> Utils <-------------------->  //
        async load() {
            let result = await this.load()
            return result
        }
        async save( data ) {
            let result = await this.save( data )
            return result
        }
    // <--------------------> Utils <-------------------->  //

    // <--------------------> Scan <-------------------->  //
        async add_flashcards() {

            this.data = await this.load()

            // We already have our data, just listen
            if( this.data ) return

            let nodes = []

            this.graph.forEachNode( node => {

                // Avoid checking for bad nodes
                if( !node.data )            return
                if( !node.data.tags )       return
                if( !node.data.tags.length ) return
                if( node.data.tags.indexOf(TAG_NAME) === -1 ) return

                nodes.push(node)

            })

            this.save({ nodes: nodes, version: 1 })

        }
    // <--------------------> Scan <-------------------->  //


}

// module.exports = SpacedRepetition
new SpacedRepetition()
