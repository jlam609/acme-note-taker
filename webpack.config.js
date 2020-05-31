const path = require('path')

module.exports = {
    entry:path.join(__dirname, './src/index.js'),
    mode:'development',
    devtool:'source-map',
    module:{
        rules:[
            {
                use:{
                    loader:'babel-loader',
                },
                exclude:/node_modules/
            },
        ]
    }
}