const axios = require('axios');
const { parseString } = require('xml2js');

class WeatherAPI {
  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.OPENWEATHER_API_KEY;
  }

  // REST/JSON API - Get current weather
  async getCurrentWeather(city, country = 'us') {
    try {
      // If no API key, return mock data
      if (!this.apiKey || this.apiKey === 'your_actual_openweather_api_key_here') {
        return this.getMockWeatherData(city);
      }

      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          q: `${city},${country}`,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        success: true,
        data: {
          city: response.data.name,
          country: response.data.sys.country,
          temperature: response.data.main.temp,
          description: response.data.weather[0].description,
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind.speed,
          source: 'openweather'
        }
      };
    } catch (error) {
      console.error('Weather API Error:', error.response?.data || error.message);
      return this.getMockWeatherData(city);
    }
  }

  // SOAP/XML Web Service - Simulate SOAP call and return XML
  async getWeatherSOAP(city) {
    try {
      // In a real SOAP service, you would make an actual SOAP call
      // For this example, we'll simulate it and return XML
      
      const weatherData = await this.getCurrentWeather(city);
      
      // Convert to XML format
      const xmlData = this.jsonToXml(weatherData.data, city);
      
      // Save to database (Phase 3 requirement)
      await this.saveWeatherDataToDB(weatherData.data, city);
      
      return {
        success: true,
        xml: xmlData,
        data: weatherData.data
      };
    } catch (error) {
      console.error('Weather SOAP Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert JSON to XML format
  jsonToXml(data, city) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<weather>
  <city>${city}</city>
  <country>${data.country || 'US'}</country>
  <temperature>${data.temperature}</temperature>
  <unit>celsius</unit>
  <description>${data.description}</description>
  <humidity>${data.humidity}</humidity>
  <wind_speed>${data.windSpeed}</wind_speed>
  <source>${data.source}</source>
  <timestamp>${new Date().toISOString()}</timestamp>
</weather>`;
    
    return xml;
  }

  // Parse XML response (if we were consuming a real SOAP service)
  async parseXmlResponse(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Save weather data to database (Phase 3 requirement)
  async saveWeatherDataToDB(weatherData, city) {
    try {
      // We'll implement this when we create the database table
      console.log('Weather data to save:', { ...weatherData, city });
      return true;
    } catch (error) {
      console.error('Save weather data error:', error);
      return false;
    }
  }

  // Mock data for when API is not available
  getMockWeatherData(city) {
    const mockData = {
      city: city,
      country: 'US',
      temperature: Math.round(15 + Math.random() * 20), // 15-35°C
      description: ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds'][Math.floor(Math.random() * 4)],
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      windSpeed: Math.round(1 + Math.random() * 10), // 1-11 m/s
      source: 'mock'
    };

    return {
      success: true,
      data: mockData
    };
  }
}

module.exports = WeatherAPI;