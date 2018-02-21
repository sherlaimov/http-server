import fs from 'fs';
import util from 'util';

const readdirAsync = function readDir(path) {
  // return new Promise((resolve, reject) => {
  //     fs.readdir(path, (err, files) => {
  //         if (err) {
  //             reject(err)
  //         } else {
  //             resolve(files);
  //         }
  //     })
  // })
  return util.promisify(fs.readdir)(path);
};

export default readdirAsync;
