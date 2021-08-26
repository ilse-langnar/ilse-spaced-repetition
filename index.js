

const printf = console.log

const TAG_NAME = "#leitner-box"
class SpacedRepetition {

    constructor( api ) {

        this.api             = api
        this.graph           = api.graph.graph

        this.init()
        this.add_things( api )

    }

    add_things( api ) {

        api.add_modal(
            "spaced-repetition",
            require("./SpacedRepetition.vue"),
            {
                box: {},
                modal: {
                    height: "80%",
                    width: "70%",
                    style: "border-radius: 10px;",
                    scrollable: false
                }
            }

        )
        api.add_command(
            "open-spaced-repetition-modal",
            "Open spaced repetition modal",
            "Will open the spaced repetition plugin modal",
            function() {
                api.Messager.emit( "modals.vue", "open", "spaced-repetition" )
            },

        )

        api.add_key( "S", "Normal", "", "open-spaced-repetition-modal", true )


        api.add_menu_item( "spaced-repetition", require("./calendar-time.svg"), "Open Spaced Repetition Modal", "open-spaced-repetition-modal", false )

    }


    // <--------------------> Init <-------------------->  //
        async init() {
            await this.add_flashcards()

            let component = await require("./index.vue")

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
            let result = await this.api.load()
            return result
        }
        async save( data ) {
            let result = await this.api.save( data )
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

module.exports = SpacedRepetition
