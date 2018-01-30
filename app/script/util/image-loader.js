/*
  Simple asunchromous image loader

  @author min yang
*/

/**
 * [description]
 * @param  {String} src             [image source to load]
 * @param  {Int} qId                [description]
 * @param  {Number} [loadDelay=300] [each delay]
 * @return {Promise}                [description]
 */
export default (src, qId, loadDelay = 0) => {

  return new Promise((response, reject) => {

    if (src) {

      const image = new Image();

      image.onload = (e) => {

        return response({
          qId,
          image,
          type: 'success',
        });

      }

      image.onerror = (e) => {

        return reject({
          qId,
          image,
          type: 'error',
        });

      }

      setTimeout(() => {

        if (src instanceof Image) {

          image.src = src.src;

        } else if (typeof src === 'string') {

          image.src = src;

        }

      }, loadDelay);

    } else {

      return reject(`${src} is not a valid image path`);

    }

  });

};
