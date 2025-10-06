import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	IconFile,
} from 'n8n-workflow';

export class WeatherApi implements ICredentialType {
	name = 'weatherApi';
	displayName = 'Weather API';
	icon = { light: 'file:weather.svg' as IconFile, dark: 'file:weather.svg' as IconFile };
	documentationUrl = 'https://openweathermap.org/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your OpenWeatherMap API key',
			required: true,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.openweathermap.org/data/3.0',
			description: 'Base URL for the Weather API',
			required: true,
		},
		{
			displayName: 'Units',
			name: 'units',
			type: 'options',
			options: [
				{
					name: 'Metric (°C, m/s, mm)',
					value: 'metric',
				},
				{
					name: 'Imperial (°F, mph, in)',
					value: 'imperial',
				},
				{
					name: 'Kelvin (K, m/s, mm)',
					value: 'standard',
				},
			],
			default: 'metric',
			description: 'Units for temperature and other measurements',
		},
		{
			displayName: 'Language',
			name: 'language',
			type: 'options',
			options: [
				{ name: 'English', value: 'en' },
				{ name: 'Spanish', value: 'es' },
				{ name: 'French', value: 'fr' },
				{ name: 'German', value: 'de' },
				{ name: 'Italian', value: 'it' },
				{ name: 'Portuguese', value: 'pt' },
				{ name: 'Russian', value: 'ru' },
				{ name: 'Chinese Simplified', value: 'zh_cn' },
				{ name: 'Japanese', value: 'ja' },
				{ name: 'Korean', value: 'kr' },
			],
			default: 'en',
			description: 'Language for weather descriptions',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				appid: '={{$credentials.apiKey}}',
				units: '={{$credentials.units}}',
				lang: '={{$credentials.language}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/onecall',
			qs: {
				lat: 33.44,
				lon: -94.04,
				appid: '={{$credentials.apiKey}}',
				units: '={{$credentials.units}}',
				lang: '={{$credentials.language}}',
			},
		},
	};
}
