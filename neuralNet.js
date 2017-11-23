/**
* Nic Enslen
* https://github.com/nenslen
*
* Parts of the code are heavily commented because this is a university
* project and I wanted this to file to be a resource that I'm able to come
* back to if I forget exactly how something works with neural nets.
*/



/**
* Represents a layer in the network
*/
function Layer() {
	
	/**
	* An array of Neuron objects that represent the neurons in this layer.
	*/
	this.neurons = [];

	/**
	* A 2D matrix that represents the weights between the neurons in this layer
	* and the next. It has the form weights[j][k], where j is a neuron
	* in the next layer, and k is a neuron in this layer, meaning that weights[j][k].value
	* is the value of the weight between the two nodes.
	*/
	this.weights = [];

	/**
	* The type of layer this is. Possible values are input, hidden, and output.
	*/
	this.layerType;


	/**
	* Initializes the layer by creating neurons and weights for it.
	* @param size: The number of neurons in this layer
	* @param sizeNext: The number of neurons in the next layer
	* @param layerType: The LayerType enum specifying the type of layer (input, hidden, output)
	*/
	this.initialize = function(size, sizeNext, layerType) {
		
		// Set layer type
		this.layerType = layerType;

		// Create neurons
		for(var i = 0; i < size; i++) {
			this.neurons[i] = new Neuron();
		}

		// Create weights
		if(this.layerType != LayerType.OUTPUT) {
			for(var i = 0; i < sizeNext; i++) {
				this.weights[i] = [];
				for(var j = 0; j < size; j++) {
					this.weights[i][j] = new Weight();
				}
			}
		}
	}


	/**
	* Activates the neurons in this layer
	* @param input: An array representing the inputs (only used for input layer)
	* @param prevLayer: The previous layer (used for all other layers)
	*/
	this.activate = function(input, prevLayer) {
		
		// Input layer
		if(this.layerType == LayerType.INPUT) {
			for(var i = 0; i < input.length; i++) {
				this.neurons[i].weightedSum = input[i];
				this.neurons[i].activation = sigmoid(input[i]);
			}
			return;
		}

		
		// Hidden/Output layers
		for(var i = 0; i < this.neurons.length; i++) {
			this.neurons[i].weightedSum = 0;
			for(var j = 0; j < prevLayer.neurons.length; j++) {
				this.neurons[i].weightedSum += prevLayer.neurons[j].activation * prevLayer.weights[i][j].value;
			}
			this.neurons[i].activation = sigmoid(this.neurons[i].weightedSum + this.neurons[i].bias);
		}
	}


	/**
	* Performs back propagation from output layer to input layer. Errors are calculated and
	* set for each neuron.
	* @param targets: The target output values (only used for output layer)
	* @param nextLayer: The next layer (used for all other layers)
	*/
	this.backpropagate = function(targets, nextLayer) {

		// Output layer
		if(this.layerType == LayerType.OUTPUT) {
			for(var i = 0; i < this.neurons.length; i++) {
				this.neurons[i].error = (this.neurons[i].activation - targets[i]) * sigmoidPrime(this.neurons[i].weightedSum);
			}
			return;
		}


		// Input/Hidden layers
		for(var i = 0; i < this.neurons.length; i++) {
			this.neurons[i].error = 0;
			for(var j = 0; j < nextLayer.neurons.length; j++) {
				this.neurons[i].error += this.weights[j][i].value * nextLayer.neurons[j].error;
			}
			this.neurons[i].error *= sigmoidPrime(this.neurons[i].weightedSum);
		}
	}


	/**
	* Calculates the gradients of each weight/bias, then applies them
	* @param nextLayer: The next layer
	*/
	this.calculateGradients = function(nextLayer, learningRate) {

		// Output layer
		if(this.layerType == LayerType.OUTPUT) {
			return;
		}


		// Calculate bias gradient
		for(var i = 0; i < this.neurons.length; i++) {
			this.neurons[i].biasGradient = this.neurons[i].error * learningRate;
			this.neurons[i].bias -= this.neurons[i].biasGradient;
		}

		// Calculate weight gradients
		for(var i = 0; i < this.neurons.length; i++) {
			for(var j = 0; j < nextLayer.neurons.length; j++) {
				this.weights[j][i].gradient = this.neurons[i].activation * nextLayer.neurons[j].error * learningRate;
				this.weights[j][i].value -= this.weights[j][i].gradient;
			}
		}
	}


	/**
	* Applies the gradients of each weight/bias, then clears them
	* @param nextLayer: The next layer
	*/
	this.applyGradients = function(nextLayer, batchSize) {

		// Output layer
		if(this.layerType == LayerType.OUTPUT) {
			return;
		}


		// Apply bias gradient
		for(var i = 0; i < this.neurons.length; i++) {
			this.neurons[i].bias -= this.neurons[i].biasGradient / batchSize;
			this.neurons[i].biasGradient = 0;
		}

		// Calculate weight gradients
		for(var i = 0; i < this.neurons.length; i++) {
			for(var j = 0; j < nextLayer.neurons.length; j++) {
				this.weights[j][i].value -= this.weights[j][i].gradient / batchSize;
				this.weights[j][i].gradient = 0;
			}
		}
	}


	/**
	* Clears all gradients
	*/
	this.clearGradients = function(nextLayer) {
		for(var i = 0; i < this.neurons.length; i++) {
			for(var j = 0; j < nextLayer.neurons.length; j++) {
				this.weights[j][i].gradient = 0;
			}
		}
	}
}


/**
* Represents a neuron in a layer
*/
function Neuron() {
	this.error = 0;
	this.weightedSum = 0;
	this.activation = 0;
	this.bias = Math.random() * .2 - .1;
	this.biasGradient = 0;
}


/**
* Represents a weight between neurons
*/
function Weight() {
	this.value = Math.random() * .2 - .1;
	this.gradient = 0;
}


/**
* Represents the neural network
* @param options: An array of options for the network
*/
function Network(options) {

	// Set options
	if(options) {
		this.options = options;
	} else {
		this.options = {
			iterations: 100,
			learningRate: 0.2,
	        log: false
		};
	}

	// Initialize layers
	this.inputLayer = new Layer();
	this.hiddenLayer1 = new Layer();
	this.hiddenLayer2 = new Layer();
	this.outputLayer = new Layer();
	this.inputLayer.initialize(784, 16, LayerType.INPUT);
	this.hiddenLayer1.initialize(16, 16, LayerType.HIDDEN);
	this.hiddenLayer2.initialize(16, 10, LayerType.HIDDEN);
	this.outputLayer.initialize(10, 0, LayerType.OUTPUT);


	/**
	* Accepts an input and propagates it forward through the network
	* @param inputs: An array containing the input values for the input layer
	* @return: An array containing the output values of the output layer
	*/
	this.input = function(inputs) {

		// Activate the layers
		this.inputLayer.activate(inputs, 0);
		this.hiddenLayer1.activate(0, this.inputLayer);
		this.hiddenLayer2.activate(0, this.hiddenLayer1);
		this.outputLayer.activate(0, this.hiddenLayer2);

		// Return the output
		var result = [];
		for(var i = 0; i < this.outputLayer.neurons.length; i++) {
			result.push(this.outputLayer.neurons[i].activation);
		}
		return result;
	}


	/**
	* Trains the network
	* @param inputs: An array representing the inputs to train on
	* @param targets: An array representing the target output values
	*/
	this.train = function(inputs, targets) {

		var count = 0;

		// Clear previous gradients
		this.inputLayer.clearGradients(this.hiddenLayer1);
		this.hiddenLayer1.clearGradients(this.hiddenLayer2);
		this.hiddenLayer2.clearGradients(this.outputLayer);


		// Iterate over batch
		for(var n = 0; n < this.options.iterations; n++) {
			
			// Train network on each input/target pair
			for(var i = 0; i < inputs.length; i++) {
				
				// Forward propagate
				var result = this.input(inputs[i], targets[i]);


				// Backpropagate
				this.outputLayer.backpropagate(targets[i], 0);
				this.hiddenLayer2.backpropagate(0, this.outputLayer);
				this.hiddenLayer1.backpropagate(0, this.hiddenLayer2);
				this.inputLayer.backpropagate(0, this.hiddenLayer1);


				// Calculate gradients
				this.inputLayer.calculateGradients(this.hiddenLayer1, this.options.learningRate);
				this.hiddenLayer1.calculateGradients(this.hiddenLayer2, this.options.learningRate);
				this.hiddenLayer2.calculateGradients(this.outputLayer, this.options.learningRate);
				this.outputLayer.calculateGradients(0);


				// Log
				if(this.options.log == true && count % 10 == 0) {
					console.log((count / this.options.iterations * 100) + "% complete");
				}
				count++;
			}

			// Apply gradients
			this.inputLayer.applyGradients(this.hiddenLayer1, inputs.length);
			this.hiddenLayer1.applyGradients(this.hiddenLayer2, inputs.length);
			this.hiddenLayer2.applyGradients(this.outputLayer, inputs.length);
			this.outputLayer.applyGradients(0);
		}
	}
};


function sigmoid(value) {
	return 1 / (1 + Math.pow(Math.E, -value));
}


function sigmoidPrime(value) {
	return sigmoid(value) * (1 - (sigmoid(value)));
}

var LayerType = Object.freeze({INPUT: 0, HIDDEN: 1, OUTPUT: 2});


//exports.neuron = Neuron;
//exports.layer = Layer;
exports.network = Network;
