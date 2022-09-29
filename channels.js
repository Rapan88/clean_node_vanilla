const fs = require("fs")
const zlib = require("zlib")

function pipeFileToSocket(filename, socket) {
    fs.createReadStream(filename).pipe(socket)
}

function pipe(readable, writable, callback) {
    function handleError(err) {
        readable.close()
        writable.close()
        callback(err)
    }

    readable.on("error", handleError)
        .pipe(writable)
        .on("error", handleError)
        .on("finish", callback)
}

function gzip(filename, callback){
    let source = fs.createReadStream(filename)
    let destination = fs.createWriteStream(filename + ".gz")
    let gzipper = zlib.createGzip()

    source.on("error", callback)
        .pipe(gzipper)
        .pipe(destination)
        .on("error", callback)
        .on("finish", callback)
}




