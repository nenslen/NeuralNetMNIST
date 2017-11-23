// Initialize client
var Client = {};
Client.socket = io.connect();


Client.test = function() {
    Client.socket.emit('test');
};


Client.socket.on('testdata', function(data) {

    var target = 0;
    var actualValue = 0;
    var actualDigit = 0;
    var totalCorrect = 0;

    for(var i = 0; i < data[200].results.length; i++) {
        for(var j = 0; j < 10; j++) {
            if(data[200].results[i].desiredOutput[j] == 1) {
                target = j;
            }

            if(data[200].results[i].output[j] > actualValue) {
                actualValue = data[200].results[0].output[j];
                actualDigit = j;
            }
        }
        if(target == actualDigit) {
            totalCorrect++;
        }
    }
    console.log(totalCorrect + " correct / " + data[200].results.length + " = " + (totalCorrect / data[200].results.length * 100) + "%");
    //console.log("target=" + target + ",actual=" + actualDigit);
    //console.log(data[200].results[0]);
    /*
    var target = 0;
    var actualValue = 0;
    var actualDigit = 0;

    for(var j = 0; j < 10; j++) {
        if(data[200].results[0].desiredOutput[j] == 1) {
            target = j;
        }
        //console.log(data[200].results[0].output[j] + " > " + actual);
        if(data[200].results[0].output[j] > actualValue) {
            actualValue = data[200].results[0].output[j];
            actualDigit = j;
        }
    }
    console.log("target=" + target + ",actual=" + actualDigit);
    console.log(data[200].results[0]);
    */
/*
    var image = data[Object.keys(data)[0]];
    var canvas = document.getElementById("imageCanvas"); 
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var imageData = context.createImageData(width, height);

    // Loop over all of the pixels
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
        	// Get pixel color
        	var pixelColor = 255 - image[(y * width + x)];

            // Set the pixel data
            var pixelIndex = (y * width + x) * 4;
            imageData.data[pixelIndex]     = pixelColor; // Red
            imageData.data[pixelIndex + 1] = pixelColor; // Green
            imageData.data[pixelIndex + 2] = pixelColor; // Blue
            imageData.data[pixelIndex + 3] = 255;        // Alpha
        }
    }

    context.putImageData(imageData, 0, 0);

    var HERMITE = new Hermite_class();
    HERMITE.resample_single(canvas, 10, 10);






	// Resize image TEST
	var canvas2 = document.getElementById("imageCanvas2"); 
    var context2 = canvas2.getContext("2d");
	
	var imgData = context.getImageData(0, 0, 10, 10);
	context2.putImageData(imgData, 0, 0);
	console.log(imgData);
	*/
});
