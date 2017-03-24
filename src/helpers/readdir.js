import fs from 'fs'

const readdirAsync = function readDir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve(files);
            }
        })
    })
}

export default readdirAsync;