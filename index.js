const { NodeClass } = require('n8n-core');
const { CredentialTypes } = require('n8n-workflow');

// Import credentials
const WeatherApiCredentials = require('./dist/credentials/WeatherApi.credentials.js');

// Import nodes
const WeatherApiNode = require('./dist/nodes/WeatherApi/WeatherApi.node.js');

// Register credentials
CredentialTypes.register(WeatherApiCredentials);

// Register nodes
NodeClass.register(WeatherApiNode);

module.exports = {
	WeatherApiCredentials,
	WeatherApiNode,
};
