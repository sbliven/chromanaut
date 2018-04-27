const path = require('path');

export default () => (
    {
        mode: 'development',
        entry: './src/entry.ts',
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'colorexplorer.js',
            libraryTarget: 'umd',
            globalObject: 'this',
            // libraryExport: 'default',
            library: 'colorexplorer'
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ]
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /(node_modules|bower_components)/,
                    use: 'babel-loader'
                },
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }

            ]
        },
    }
);
