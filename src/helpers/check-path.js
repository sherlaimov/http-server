import fs from "fs";

const checkPath = function checkPath(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.R_OK || fs.constants.W_OK, err => {
    //   console.log(err ? "no access!" : "Can read or write");
      console.log(err);
      if (err) {
        reject(err);
      } else {
        fs.stat(path, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }
    });
  });
};

export default checkPath;

// function checkIfFile(file, cb) {
//   fs.stat(file, function fsStat(err, stats) {
//     if (err) {
//       if (err.code === "ENOENT") {
//         return cb(null, false);
//       } else {
//         return cb(err);
//       }
//     }
//     return cb(null, stats.isFile());
//   });
// }
