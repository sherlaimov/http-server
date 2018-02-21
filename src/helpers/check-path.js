import fs from 'fs';

const checkPath = function checkPath(path) {
  return new Promise((resolve, reject) => {
    // access maybe excessive here?
    fs.access(path, fs.constants.R_OK || fs.constants.W_OK, err => {
      //   console.log(err ? "no access!" : "Can read or write");
      if (err) {
        reject(err);
      } else {
        fs.stat(path, (er, data) => {
          if (er) {
            reject(er);
          } else {
            resolve(data);
          }
        });
      }
    });
  });
};

export default checkPath;
