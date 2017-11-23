// Get requirements
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var _ = require('lodash');
var stopwatch = require('node-stopwatch').Stopwatch
var nn = require('./neuralNet.js');


// Initialize server
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
server.listen(8081, function() {
    console.log('Listening on ' + server.address().port);
});


// Socket.io connections
io.on('connection', function(socket) {
	// Test
    socket.on('test', function() {
    	socket.emit('testdata', testResults);
    });
});




// Network variables
var sw = stopwatch.create();
var totalTrainingExamples = 5000;
var batchSize = 100;
var options = {
	iterations: 50,
	learningRate: 0.05,
    log: false
};




// Open files for training images/labels
var imageFileBuffer = fs.readFileSync(__dirname + '/train-images-idx3-ubyte');
var labelFileBuffer = fs.readFileSync(__dirname + '/train-labels-idx1-ubyte');
var trainingPixels = [];
var trainingTargets = [];

// Convert MNIST data into training format the network can use
for(var i = 0; i < totalTrainingExamples; i++) {

	/** Inputs **/
	// Get each pixel in the image
	var pixels = [];
	for(var x = 0; x < 28; x++) {
		for(var y = 0; y < 28; y++) {
			pixels.push(imageFileBuffer[(i * 28 * 28) + (y + (x * 28)) + 16]);
		}
	}


	/** Outputs **/
	// Get label for digit
	var label = JSON.stringify(labelFileBuffer[i + 8]);
	
	// Calculate output targets
	var targets = [];
	for(var j = 0; j < 10; j++) {
		targets[j] = (j == label) ? 1 : 0;
	}


	// Add training example to the training set
	trainingPixels.push(pixels);
	trainingTargets.push(targets);
}




// Initialize network
var network = new nn.network(options);


// Train the network
console.log("Starting training...");
console.log("==============================");
var totalCorrect = 0;
sw.start();

// Train in batches
for(var batch = 0; batch < totalTrainingExamples / batchSize; batch++) {

	// Keep track of correct guesses
	var totalBatchCorrect = 0;

	// Get training batch
	var batchTrainingPixels = trainingPixels.slice(batch * batchSize, batch * batchSize + batchSize);
	var batchTrainingTargets = trainingTargets.slice(batch * batchSize, batch * batchSize + batchSize);

	// Train the network with this batch
	network.train(batchTrainingPixels, batchTrainingTargets);

	// Check progress for this batch, using the batch training data itself
	for(var i = 0; i < batchSize; i++) {

		// Initialize result variables
		var target = 0;
		var actualValue = 0;
		var actualDigit = 0;

		// Process each item in the batch
		var out = network.input(batchTrainingPixels[i]);

		// Find target vs actual values
	    for(var j = 0; j < 10; j++) {
	    	//console.log("i=" + i + ",j=" + j);
	        if(batchTrainingTargets[i][j] == 1) {
	            target = j;
	        }

	        if(out[j] > actualValue) {
	            actualValue = out[j];
	            actualDigit = j;
	        }
	    }

	    // Check if network was correct
	    if(target == actualDigit) {
	        totalCorrect++;
	        totalBatchCorrect++;
	    }
	}
	

	// Show result for this batch
	console.log("Batch " + (batch + 1) + " of " + totalTrainingExamples / batchSize + ": " + totalBatchCorrect + " / " + batchSize + " = " + Math.round((totalBatchCorrect / batchSize * 100) * 100) / 100 + "%");
}

// Show result for batch average
console.log("==============================");
console.log("Batch Average: " + totalCorrect + " / " + totalTrainingExamples + " = " + Math.round((totalCorrect / totalTrainingExamples * 100) * 100) / 100 + "%");





// Show test result for all training examples
totalCorrect = 0;
for(var i = 0; i < totalTrainingExamples; i++) {

	// Initialize result variables
	var target = 0;
	var actualValue = 0;
	var actualDigit = 0;

	// Process each training example
	var out = network.input(trainingPixels[i]);

	// Find target vs actual values
    for(var j = 0; j < 10; j++) {
        if(trainingTargets[i][j] == 1) {
            target = j;
        }

        if(out[j] > actualValue) {
            actualValue = out[j];
            actualDigit = j;
        }
    }

    // Check if network was correct
    if(target == actualDigit) {
        totalCorrect++;
    }
}


console.log("==============================");
console.log("--OPTIONS--");
console.log("Images:        " + totalTrainingExamples);
console.log("Batch Size:    " + batchSize);
console.log("Learning Rate: " + options.learningRate);
console.log("Iterations:    " + options.maxIterations);
console.log("--RESULTS--");
console.log("Success Rate:        " + totalCorrect + " / " + totalTrainingExamples + " = " + Math.round((totalCorrect / totalTrainingExamples * 100) * 100) / 100 + "%");
console.log("Total Time Elapsed = " + Math.round(sw.elapsed.minutes * 100) / 100 + " minutes");
sw.stop();
