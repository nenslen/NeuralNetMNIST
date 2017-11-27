/**
* Nic Enslen
* https://github.com/nenslen
*
* Parts of the code are heavily commented because this is a university
* project. Also, I wanted this to be a resource for future neural net
* projects that I'm able to come back to and reference.
*
* The equations that are referenced can be found in the equations.pdf
* document in the github repository for this project.
*/



/**
* Represents a layer in the network
*/
function Layer() {
	
	/**
	* An array of Neuron objects that represent the neurons in this layer
	*/
	this.neurons = [];

	/**
	* A 2D matrix that represents the weights between the neurons in this layer
	* and the next. It has the form weights[j][k], where j is a neuron
	* in the next layer, and k is a neuron in this layer, meaning that weights[j][k].value
	* is the value of the weight between the two neurons.
	*/
	this.weights = [];

	/**
	* The type of layer this is. Possible values are input, hidden, and output
	*/
	this.layerType;


	/**
	* Initializes the layer by creating neurons and assigning random weights & biases to them
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

		/**
		* We only create weights for input and hidden layers. Output layers have no need
		* for weights since weights represent connections between neurons in this layer
		* and neurons in the next layer.
		*/
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
	* Activates the neurons in this layer. The weighted sum and activation are calculated
	* and stored at each neuron, as they are needed now during forward propagation and
	* also later for backpropagation.
	* @param input: An array representing the inputs (only used for input layer)
	* @param prevLayer: The previous layer (used for all other layers)
	*/
	this.activate = function(input, prevLayer) {
		
		/**
		* For input layer neurons, the weighted sum is simply the given input value.
		* We don't need to do any special calculations for it. The activation is done the
		* same was as other layers (sigmoid).
		*/
		if(this.layerType == LayerType.INPUT) {
			for(var i = 0; i < input.length; i++) {
				this.neurons[i].weightedSum = input[i];
				this.neurons[i].activation = sigmoid(input[i]); // Equation 2
			}
			return;
		}

		
		/**
		* For hidden and output layers, the weighted sum of a neuron is computed by multiplying the
		* activation of each neuron in the previous layer with its corresponding weight to the neuron.
		* The activation of each neuron is then calculated by applying the activation function (sigmoid) to 
		* the weighted sum of that neuron.
		*/
		for(var i = 0; i < this.neurons.length; i++) {
			this.neurons[i].weightedSum = 0;

			// Equation 1
			for(var j = 0; j < prevLayer.neurons.length; j++) {
				this.neurons[i].weightedSum += prevLayer.neurons[j].activation * prevLayer.weights[i][j].value;
			}

			// Equation 2
			this.neurons[i].activation = sigmoid(this.neurons[i].weightedSum + this.neurons[i].bias);
		}
	}


	/**
	* Errors are calculated and set for each neuron by using backpropagation
	* @param targets: The target output values (only used for output layer)
	* @param nextLayer: The next layer (used for all other layers)
	*/
	this.backpropagate = function(targets, nextLayer) {

		/**
		* The errors of the output layer neurons are calculated by taking the difference between
		* their target value and actual activation. This difference is then multiplied by the 
		* sigmoid prime of the neuron's weighted sum.
		*/
		if(this.layerType == LayerType.OUTPUT) {
			for(var i = 0; i < this.neurons.length; i++) {
				// Equation 3
				this.neurons[i].error = (this.neurons[i].activation - targets[i]) * sigmoidPrime(this.neurons[i].weightedSum);
			}
			return;
		}


		/**
		* For input and hidden neurons, the error is calculated based on the errors and weights
		* of neurons in the previous layer. This is done by taking the sum of each weight/error
		* of neurons in the previous layer and multiplying it by the sigmoid prime of this neuron's
		* weighted sum.
		*/
		for(var i = 0; i < this.neurons.length; i++) {
			// Equation 4
			this.neurons[i].error = 0;
			for(var j = 0; j < nextLayer.neurons.length; j++) {
				this.neurons[i].error += this.weights[j][i].value * nextLayer.neurons[j].error;
			}
			this.neurons[i].error *= sigmoidPrime(this.neurons[i].weightedSum);
		}
	}


	/**
	* Calculates the gradient of each weight/bias and applies the changes
	* @param nextLayer: The next layer
	* @param learningRate: The rate at which the network learns
	*/
	this.calculateGradients = function(nextLayer, learningRate) {

		/**
		* For the output layer, we don't need to calculate any gradients
		*/
		if(this.layerType == LayerType.OUTPUT) {
			return;
		}


		/**
		* For input and hidden neurons, the gradient of their bias
		* is simply equal to the error of the neuron. To adjust the bias
		* so that it performs better next time, we multiply the gradient by
		* a pre-determined learning rate and subtract it from the bias.
		*/
		for(var i = 0; i < this.neurons.length; i++) {
			// Equation 5
			this.neurons[i].biasGradient = this.neurons[i].error * learningRate;
			this.neurons[i].bias -= this.neurons[i].biasGradient;
		}

		/**
		* For input and hidden neurons, the gradients of their weights is calculated using
		* the neuron's activation and the error of the next layer's neuron. We then apply
		* our learning weight and adjust the weight's value.
		*/
		for(var i = 0; i < this.neurons.length; i++) {
			// Equation 6
			for(var j = 0; j < nextLayer.neurons.length; j++) {
				this.weights[j][i].gradient = this.neurons[i].activation * nextLayer.neurons[j].error * learningRate;
				this.weights[j][i].value -= this.weights[j][i].gradient;
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
	* Trains the network on a given set of training examples
	* @param inputs: An array representing the inputs to train on
	* @param targets: An array representing the target output values
	*/
	this.train = function(inputs, targets) {

		var count = 0;

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
		}
	}
};


// The sigmoid activation function
function sigmoid(value) {
	return 1 / (1 + Math.pow(Math.E, -value));
}


// The sigmoid prime function
function sigmoidPrime(value) {
	return sigmoid(value) * (1 - (sigmoid(value)));
}

// LayerType enum
var LayerType = Object.freeze({INPUT: 0, HIDDEN: 1, OUTPUT: 2});

exports.network = Network;
