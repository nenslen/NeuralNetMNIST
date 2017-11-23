$(function() {
	//Client.test();

	var el = document.getElementById('sketchpad');
	var pad = new Sketchpad(el);

	pad.canvas.setAttribute('width', 280);
    pad.canvas.setAttribute('height', 280);
    pad.canvas.style.width = 280 + 'px';
    pad.canvas.style.height = 280 + 'px';
    pad.setLineSize(30);


    $('#undoButton').click(function() {
    	pad.undo();
    });


    $('#redoButton').click(function() {
    	pad.redo();
    });


    $('#clearButton').click(function() {
    	pad.clear();
    });


    $('#submitButton').click(function() {
        Client.predict();
        /*
    	// Get the image data from the sketchpad
    	var el = $('#sketchpad > canvas');
		var padContext = el[0].getContext('2d');
		var imageData = padContext.getImageData(0, 0, 280, 280);


    	// Put the image data from the sketchpad into the hidden canvas
    	var hiddenCanvas = document.getElementById("hiddenCanvas");
    	var hiddenContext = hiddenCanvas.getContext("2d");
		hiddenContext.putImageData(imageData, 0, 0);
		

    	// Resize the hidden canvas image to 28x28
        var HERMITE = new Hermite_class();
        HERMITE.resample_single(hiddenCanvas, 28, 28);


		// Put resized image onto resized canvas
		var resizedCanvas = document.getElementById('resizedCanvas');
		var resizedContext = resizedCanvas.getContext('2d');
		var image = new Image();
		var dataURL = hiddenCanvas.toDataURL();
		image.onload = function() {
            // Fit resized 28x28 image to fill 280x280 canvas
            resizedContext.clearRect(0, 0, 280, 280);
            resizedContext.drawImage(image,0,0,28,28,0,0,280,280);
        }
        image.src = dataURL;


        // Disable smoothing so pixels are clear
        resizedContext.webkitImageSmoothingEnabled = false;
		resizedContext.mozImageSmoothingEnabled = false;
		resizedContext.imageSmoothingEnabled = false;
        */
    });
});