import SeamCarving from './SeamCarving';

const imageSrc = require('../img/Image2.jpeg');

const seamCarving = new SeamCarving();

seamCarving.init(imageSrc)
  .then(() => {
    seamCarving.sobel();
    seamCarving.seamCarving();
  });
