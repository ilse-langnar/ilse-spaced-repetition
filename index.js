

const printf = console.log

const TAG_NAME = "#leitner-box"
class SpacedRepetition {

    constructor( api ) {

        printf( "1" )
        this.api             = api
        printf( "2" )
        this.graph           = api.graph.graph

        printf( "3" )
        this.init()

    }

    // <--------------------> Init <-------------------->  //
        async init() {
        printf( "4" )
            await this.add_flashcards()

        printf( "5" )
            let component = await require("./index.vue")

        printf( "6" )
            printf( "33333 this.data -> ", this.data )
            this.api.add_box( "spaced-repetition-plugin", component, {
                files: this.data || [],
                example: "OLOLOL"
            })
        printf( "7" )



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

            printf( "before -> this.data -> ", this.data )
            this.data = await this.load()
            printf( "after -> this.data -> ", this.data )

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
