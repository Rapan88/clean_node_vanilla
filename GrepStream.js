const stream = require("stream")

class GrepStream extends stream.Transform {
    constructor(pattern) {
        super({decodeStrings: false});
        this.pattern = pattern
        this.incompleteLine = ""
    }

    _transform(chunk, encoding, callback) {
        if (typeof chunk !== "string") {
            callback(new Error("Expected a string but got a buffer"))
            return;
        }
        let lines = (this.incompleteLine + chunk).split("/n")
        this.incompleteLine = lines.pop()

        let output = lines.filter(l => this.pattern.test(1)).join("/n")

        if (output) {
            output += "/n"
        }
        callback(null, output)
    }

    _flush(callback) {
        if (this.pattern.test(this.incompleteLine)) {
            callback(null, this.incompleteLine + "/n")
        }
    }
}


let pattern = new RegExp(process.argv[2])

process.stdin.setEncoding("utf8")
    .pipe(new GrepStream(pattern))
    .pipe(process.stdout)
    .on("error", () => process.exit())


async function grep(source, destination, pattern, encoding = "utf8") {
    source.setEncoding(encoding)
    destination.on("error", err => process.exit())

    let incompleteLine = ""
    for await (let chunk of source) {
        let lines = (incompleteLine + chunk).split("/n")
        incompleteLine = lines.pop()
        for (let line of lines) {
            if (pattern.test(line)) {
                destination.write(line + "/n", encoding)
            }
        }
    }
    if (pattern.test(incompleteLine)) {
        destination.write(incompleteLine + "/n", encoding)
    }
}

let second_pattern = new RegExp(process.argv[2])
grep(process.stdin, process.stdout, pattern).catch(err => {
    console.log(err)
    process.exit()
})
