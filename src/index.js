


const TAG_NAME = "#leitner-box"
class SpacedRepetition extends Plugin {

    constructor(  ) {
        super()

        const printf = console.log

        alert( "Lqwdionqdionqdionqdw" )
        printf( "I'm the spaced repetition plugin" )

        // this.api             = api
        // this.graph           = api.graph.graph

        // this.init()
        // this.add_things( api )

    }

    add_things( api ) {

        printf( "@@@@@@@@" )
        api.add_modal(
            "spaced-repetition",
            api.require("./SpacedRepetition.vue"),
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

        api.add_box( "Spaced Repetition", api.require("./index.vue"), {} )

        api.add_command(
            "open-spaced-repetition-modal",
            "Open spaced repetition modal",
            "Will open the spaced repetition plugin modal",
            function() {
                api.Messager.emit( "modals.vue", "open", { target: "spaced-repetition"})
            },

        )

        api.add_key( "S", "Normal", "", "open-spaced-repetition-modal", true )


        api.add_menu_item( "spaced-repetition", api.require("./calendar-time.svg"), "Open Spaced Repetition Modal", "open-spaced-repetition-modal", false )

    }


    // <--------------------> Init <-------------------->  //
        async init() {
            await this.add_flashcards()

            let component = await api.require("./index.vue")

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

// module.exports = SpacedRepetition
new SpacedRepetition()
