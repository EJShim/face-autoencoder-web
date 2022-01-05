const path = require('path')
const fs = require('fs-extra')
const glob = require('glob')


const wasmCopy = () =>{
    const solutionPath = process.cwd();    
    const ortWasmFiles = glob.sync(path.join(solutionPath, 'node_modules', 'onnxruntime-web', 'dist', "*.wasm"));
    ortWasmFiles.forEach(file=>{
        fs.copySync( file, path.join(solutionPath, 'public', 'static', 'js', path.basename(file)));        
    });
}

wasmCopy();