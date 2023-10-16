import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import { createRequire } from 'module';
const pkg = createRequire(import.meta.url)('./package.json');

export default {
    input: 'src/checkBox.js',
    output: [
        {
            file: 'dist/checkBox.min.js',
            format: 'umd',
            name: 'CheckBox',
            plugins: [terser()],
        }
    ],
    plugins: [
        replace({
            preventAssignment: true,
            __version__: pkg.version
        }),
        postcss({
            extract: true,
            minimize: true,
            sourceMap: false
        }),
    ]
};
