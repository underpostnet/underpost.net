const sharp = require('sharp');

// original image
let originalImage = 'tag.png';

// file name for cropped image
let outputImage = 'tag2.png';

// IMPORTANTE: respeta transparencia, input y output distintos nombres

sharp(originalImage).extract({

  width: 3375,
  height: 1414,
  left: 0,
  top: 0

}).toFile(outputImage)
    .then(function(new_file_info) {
        console.log("Image cropped and saved");
    })
    .catch(function(err) {
        console.log("An error occured");
        console.log(err);
    });
