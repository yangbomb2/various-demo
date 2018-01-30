/*
  iamge loader
*/

export default function(imageSrc, cb) {

  let img = new Image();

  return new Promise((response, reject)=> {

    img.onload = function(e) {
      response(img);
    };

    img.onerror = function(e) {
      throw new Error(imageSrc + ' load error');
    };

    img.src = imageSrc;
  });


};
