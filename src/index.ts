import SeamCarving from './SeamCarving';

const imageSrc = require('../img/Image.jpeg');

const seamCarving = new SeamCarving();

seamCarving.init(imageSrc)
  .then(() => {

    seamCarving.sobel();
  });
