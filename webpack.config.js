import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // Path to current file
const __dirname = path.dirname(__filename); // Directory of current file

export default {
    entry: __dirname + '/src/typescript/index.ts',
    output: {
        filename: 'app.bundle.js', // Name of the bundled output file
        path: path.resolve(__dirname, 'dist'), // Output directory
        clean: true, // Clean the output directory before each build
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/, // Apply this rule to .ts and .tsx files
                use: 'ts-loader', // Use ts-loader to transpile TypeScript
                exclude: /node_modules/, // Exclude dependencies
            },
            {
                test: /\.css$/, // Apply this rule to .css files
                use: ['style-loader', 'css-loader'], // Use css-loader then style-loader
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i, // Match common image file types
                type: 'asset/resource', // Tells Webpack to emit the file and return the URL
            },
        ],
    },
    watch: true,
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: path.resolve(__dirname, 'dist'), // Serve static files from the 'dist' directory
        port: 3000, // Serve the app on http://localhost:3000
        open: true, // Automatically open the browser when the server starts
    },
};
