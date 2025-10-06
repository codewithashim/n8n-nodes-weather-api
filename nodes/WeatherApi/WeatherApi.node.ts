import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class WeatherApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Weather API',
		name: 'weatherApi',
		icon: 'file:weather.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get weather data from OpenWeatherMap API',
		defaults: {
			name: 'Weather API',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'weatherApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Current Weather',
						value: 'current',
					},
					{
						name: 'Weather Forecast',
						value: 'forecast',
					},
					{
						name: 'Weather Alerts',
						value: 'alerts',
					},
				],
				default: 'current',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['current'],
					},
				},
				options: [
					{
						name: 'Get Current Weather',
						value: 'getCurrent',
						action: 'Get current weather data',
						description: 'Get current weather conditions for a location',
						routing: {
							request: {
								method: 'GET',
								url: '/weather',
							},
						},
					},
				],
				default: 'getCurrent',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['forecast'],
					},
				},
				options: [
					{
						name: 'Get 5-Day Forecast',
						value: 'getForecast',
						action: 'Get 5-day weather forecast',
						description: 'Get 5-day weather forecast for a location',
						routing: {
							request: {
								method: 'GET',
								url: '/forecast',
							},
						},
					},
					{
						name: 'Get Hourly Forecast',
						value: 'getHourly',
						action: 'Get hourly weather forecast',
						description: 'Get hourly weather forecast for a location',
						routing: {
							request: {
								method: 'GET',
								url: '/forecast/hourly',
							},
						},
					},
				],
				default: 'getForecast',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['alerts'],
					},
				},
				options: [
					{
						name: 'Get Weather Alerts',
						value: 'getAlerts',
						action: 'Get weather alerts',
						description: 'Get weather alerts for a location',
						routing: {
							request: {
								method: 'GET',
								url: '/onecall',
							},
						},
					},
				],
				default: 'getAlerts',
			},
			{
				displayName: 'Location Type',
				name: 'locationType',
				type: 'options',
				options: [
					{
						name: 'City Name',
						value: 'city',
					},
					{
						name: 'Coordinates',
						value: 'coordinates',
					},
					{
						name: 'ZIP Code',
						value: 'zip',
					},
					{
						name: 'City ID',
						value: 'cityId',
					},
				],
				default: 'city',
				description: 'How to specify the location',
			},
			{
				displayName: 'City Name',
				name: 'city',
				type: 'string',
				default: '',
				placeholder: 'e.g., London',
				displayOptions: {
					show: {
						locationType: ['city'],
					},
				},
				description: 'Name of the city',
			},
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				default: '',
				placeholder: 'e.g., UK',
				displayOptions: {
					show: {
						locationType: ['city'],
					},
				},
				description: 'Two-letter country code (optional)',
			},
			{
				displayName: 'Latitude',
				name: 'latitude',
				type: 'number',
				default: 0,
				placeholder: 'e.g., 51.5074',
				displayOptions: {
					show: {
						locationType: ['coordinates'],
					},
				},
				description: 'Latitude coordinate',
			},
			{
				displayName: 'Longitude',
				name: 'longitude',
				type: 'number',
				default: 0,
				placeholder: 'e.g., -0.1278',
				displayOptions: {
					show: {
						locationType: ['coordinates'],
					},
				},
				description: 'Longitude coordinate',
			},
			{
				displayName: 'ZIP Code',
				name: 'zipCode',
				type: 'string',
				default: '',
				placeholder: 'e.g., 10001',
				displayOptions: {
					show: {
						locationType: ['zip'],
					},
				},
				description: 'ZIP/Postal code',
			},
			{
				displayName: 'Country Code',
				name: 'zipCountryCode',
				type: 'string',
				default: '',
				placeholder: 'e.g., US',
				displayOptions: {
					show: {
						locationType: ['zip'],
					},
				},
				description: 'Two-letter country code for ZIP code',
			},
			{
				displayName: 'City ID',
				name: 'cityId',
				type: 'string',
				default: '',
				placeholder: 'e.g., 2643743',
				displayOptions: {
					show: {
						locationType: ['cityId'],
					},
				},
				description: 'OpenWeatherMap city ID',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include UV Index',
						name: 'includeUv',
						type: 'boolean',
						default: false,
						description: 'Whether to include UV index data',
					},
					{
						displayName: 'Include Air Quality',
						name: 'includeAirQuality',
						type: 'boolean',
						default: false,
						description: 'Whether to include air quality data',
					},
					{
						displayName: 'Include Minute Forecast',
						name: 'includeMinuteForecast',
						type: 'boolean',
						default: false,
						description: 'Whether to include minute-by-minute forecast for 1 hour',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const locationType = this.getNodeParameter('locationType', i) as string;
				const additionalOptions = this.getNodeParameter('additionalOptions', i) as any;

				// Build query parameters based on location type
				const queryParams: any = {};

				switch (locationType) {
					case 'city': {
						const city = this.getNodeParameter('city', i) as string;
						const countryCode = this.getNodeParameter('countryCode', i) as string;
						if (!city) {
							throw new NodeOperationError(this.getNode(), 'City name is required');
						}
						queryParams.q = countryCode ? `${city},${countryCode}` : city;
						break;
					}
					case 'coordinates': {
						const latitude = this.getNodeParameter('latitude', i) as number;
						const longitude = this.getNodeParameter('longitude', i) as number;
						if (!latitude || !longitude) {
							throw new NodeOperationError(this.getNode(), 'Both latitude and longitude are required');
						}
						queryParams.lat = latitude;
						queryParams.lon = longitude;
						break;
					}
					case 'zip': {
						const zipCode = this.getNodeParameter('zipCode', i) as string;
						const zipCountryCode = this.getNodeParameter('zipCountryCode', i) as string;
						if (!zipCode) {
							throw new NodeOperationError(this.getNode(), 'ZIP code is required');
						}
						queryParams.zip = zipCountryCode ? `${zipCode},${zipCountryCode}` : zipCode;
						break;
					}
					case 'cityId': {
						const cityId = this.getNodeParameter('cityId', i) as string;
						if (!cityId) {
							throw new NodeOperationError(this.getNode(), 'City ID is required');
						}
						queryParams.id = cityId;
						break;
					}
				}

				// Add additional options for OneCall API
				if (resource === 'alerts' || (additionalOptions && Object.keys(additionalOptions).length > 0)) {
					queryParams.exclude = 'minutely,hourly,daily';
					if (additionalOptions.includeUv) {
						queryParams.exclude = queryParams.exclude.replace('minutely,hourly,daily', 'minutely,hourly');
					}
					if (additionalOptions.includeAirQuality) {
						// Air quality is included by default in OneCall API
					}
					if (additionalOptions.includeMinuteForecast) {
						queryParams.exclude = queryParams.exclude.replace('minutely,', '');
					}
				}

				// Make the API request
				const response = await this.helpers.requestWithAuthentication.call(this, 'weatherApi', {
					method: 'GET',
					qs: queryParams,
				});

				// Process the response based on the operation
				let processedData: any;

				switch (operation) {
					case 'getCurrent': {
						processedData = {
							location: {
								name: response.name,
								country: response.sys.country,
								coordinates: {
									latitude: response.coord.lat,
									longitude: response.coord.lon,
								},
							},
							weather: {
								main: response.weather[0].main,
								description: response.weather[0].description,
								icon: response.weather[0].icon,
								temperature: response.main.temp,
								feelsLike: response.main.feels_like,
								minTemp: response.main.temp_min,
								maxTemp: response.main.temp_max,
								humidity: response.main.humidity,
								pressure: response.main.pressure,
								visibility: response.visibility,
								wind: {
									speed: response.wind.speed,
									direction: response.wind.deg,
								},
								clouds: response.clouds.all,
								rain: response.rain || {},
								snow: response.snow || {},
							},
							timestamp: new Date(response.dt * 1000).toISOString(),
							sunrise: new Date(response.sys.sunrise * 1000).toISOString(),
							sunset: new Date(response.sys.sunset * 1000).toISOString(),
						};
						break;
					}
					case 'getForecast': {
						processedData = {
							location: {
								name: response.city.name,
								country: response.city.country,
								coordinates: {
									latitude: response.city.coord.lat,
									longitude: response.city.coord.lon,
								},
							},
							forecast: response.list.map((item: any) => ({
								timestamp: new Date(item.dt * 1000).toISOString(),
								weather: {
									main: item.weather[0].main,
									description: item.weather[0].description,
									icon: item.weather[0].icon,
								},
								temperature: {
									current: item.main.temp,
									feelsLike: item.main.feels_like,
									min: item.main.temp_min,
									max: item.main.temp_max,
								},
								humidity: item.main.humidity,
								pressure: item.main.pressure,
								wind: {
									speed: item.wind.speed,
									direction: item.wind.deg,
								},
								clouds: item.clouds.all,
								rain: item.rain || {},
								snow: item.snow || {},
								visibility: item.visibility,
							})),
						};
						break;
					}
					case 'getHourly': {
						// Similar to getForecast but for hourly data
						processedData = {
							location: {
								name: response.city.name,
								country: response.city.country,
								coordinates: {
									latitude: response.city.coord.lat,
									longitude: response.city.coord.lon,
								},
							},
							hourlyForecast: response.list.map((item: any) => ({
								timestamp: new Date(item.dt * 1000).toISOString(),
								weather: {
									main: item.weather[0].main,
									description: item.weather[0].description,
									icon: item.weather[0].icon,
								},
								temperature: {
									current: item.main.temp,
									feelsLike: item.main.feels_like,
									min: item.main.temp_min,
									max: item.main.temp_max,
								},
								humidity: item.main.humidity,
								pressure: item.main.pressure,
								wind: {
									speed: item.wind.speed,
									direction: item.wind.deg,
								},
								clouds: item.clouds.all,
								rain: item.rain || {},
								snow: item.snow || {},
								visibility: item.visibility,
							})),
						};
						break;
					}
					case 'getAlerts': {
						processedData = {
							location: {
								coordinates: {
									latitude: response.lat,
									longitude: response.lon,
								},
								timezone: response.timezone,
							},
							current: response.current ? {
								temperature: response.current.temp,
								feelsLike: response.current.feels_like,
								humidity: response.current.humidity,
								pressure: response.current.pressure,
								uvi: response.current.uvi,
								visibility: response.current.visibility,
								wind: {
									speed: response.current.wind_speed,
									direction: response.current.wind_deg,
								},
								weather: response.current.weather[0],
							} : null,
							alerts: response.alerts || [],
							uvIndex: response.current?.uvi || null,
							airQuality: response.current?.air_quality || null,
						};
						break;
					}
					default:
						processedData = response;
				}

				returnData.push({
					json: processedData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
