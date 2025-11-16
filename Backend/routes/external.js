// routes/external.js
const express = require('express');
const EnhancedCarbonCalculator = require('../services/enhancedCarbonCalculator');
const WeatherAPI = require('../services/weatherAPI');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const carbonCalculator = new EnhancedCarbonCalculator();
const weatherAPI = new WeatherAPI();

// Carbon API Routes - USING LOCAL CALCULATOR

// Calculate vehicle emissions
router.post('/carbon/vehicle', authenticate, async (req, res) => {
  try {
    const { distance, distanceUnit, vehicleType, passengers } = req.body;
    
    const result = carbonCalculator.calculateTransport(
      distance || 10,
      distanceUnit || 'km',
      vehicleType || 'car_petrol_medium',
      passengers || 1
    );
    
    res.json(result);
  } catch (error) {
    console.error('Vehicle emission calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate vehicle emissions' 
    });
  }
});

// Calculate electricity emissions
router.post('/carbon/electricity', authenticate, async (req, res) => {
  try {
    const { electricityValue, electricityUnit, country } = req.body;
    
    const result = carbonCalculator.calculateElectricity(
      electricityValue || 1,
      electricityUnit || 'kwh',
      country || 'US'
    );
    
    res.json(result);
  } catch (error) {
    console.error('Electricity emission calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate electricity emissions' 
    });
  }
});

// Calculate flight emissions
router.post('/carbon/flight', authenticate, async (req, res) => {
  try {
    const { passengers, distance, distanceUnit, flightType } = req.body;
    
    const result = carbonCalculator.calculateFlight(
      passengers || 1,
      distance || 100,
      distanceUnit || 'km',
      flightType || 'flight_domestic'
    );
    
    res.json(result);
  } catch (error) {
    console.error('Flight emission calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate flight emissions' 
    });
  }
});

// New endpoint for diet emissions
router.post('/carbon/diet', authenticate, async (req, res) => {
  try {
    const { meals, dietType } = req.body;
    
    const result = carbonCalculator.calculateDiet(
      meals || 1,
      dietType || 'average'
    );
    
    res.json(result);
  } catch (error) {
    console.error('Diet emission calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate diet emissions' 
    });
  }
});

// Comprehensive footprint calculation
router.post('/carbon/footprint', authenticate, async (req, res) => {
  try {
    const { activities } = req.body;
    
    if (!activities || !Array.isArray(activities)) {
      return res.status(400).json({
        success: false,
        error: 'Activities array is required'
      });
    }
    
    const result = carbonCalculator.calculateDailyFootprint(activities);
    res.json(result);
  } catch (error) {
    console.error('Footprint calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate footprint' 
    });
  }
});

// Get available calculation methods
router.get('/carbon/methods', authenticate, (req, res) => {
  try {
    const methods = carbonCalculator.getEmissionFactors();
    res.json({
      success: true,
      methods: methods
    });
  } catch (error) {
    console.error('Get methods error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get calculation methods' 
    });
  }
});

// Weather API Routes (UNCHANGED)

// REST/JSON Weather API
router.get('/weather/current', authenticate, async (req, res) => {
  try {
    const { city, country } = req.query;
    
    const result = await weatherAPI.getCurrentWeather(
      city || 'New York',
      country || 'us'
    );
    
    res.json(result);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch weather data' 
    });
  }
});

// SOAP/XML Weather Web Service
router.get('/weather/soap', authenticate, async (req, res) => {
  try {
    const { city } = req.query;
    
    const result = await weatherAPI.getWeatherSOAP(city || 'New York');
    
    if (result.success) {
      // Set XML content type
      res.set('Content-Type', 'application/xml');
      res.send(result.xml);
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Weather SOAP error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch SOAP weather data' 
    });
  }
});

// Combined endpoint that uses both carbon and weather
router.post('/calculate-footprint', authenticate, async (req, res) => {
  try {
    const { activityType, value, unit, location, vehicleType, passengers, country } = req.body;
    
    let carbonResult;
    
    switch (activityType) {
      case 'transport':
        carbonResult = carbonCalculator.calculateTransport(value, unit, vehicleType, passengers);
        break;
      case 'electricity':
        carbonResult = carbonCalculator.calculateElectricity(value, unit, country);
        break;
      case 'flight':
        carbonResult = carbonCalculator.calculateFlight(passengers || 1, value, unit);
        break;
      case 'diet':
        carbonResult = carbonCalculator.calculateDiet(value, unit);
        break;
      default:
        carbonResult = carbonCalculator.calculateTransport(value, unit);
    }
    
    let weatherResult = null;
    if (location) {
      weatherResult = await weatherAPI.getCurrentWeather(location);
    }
    
    res.json({
      success: true,
      carbon_emission: carbonResult,
      weather_data: weatherResult,
      activity: {
        type: activityType,
        value: value,
        unit: unit,
        location: location,
        vehicleType: vehicleType,
        passengers: passengers,
        country: country
      }
    });
    
  } catch (error) {
    console.error('Combined footprint calculation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate footprint' 
    });
  }
});

// Test endpoint to verify external routes are working
router.get('/test', authenticate, (req, res) => {
  res.json({ 
    message: 'External API routes are working!',
    apis: {
      carbon: 'Enhanced Local Carbon Calculator',
      weather: 'OpenWeather API',
      soap_xml: 'SOAP/XML Weather Service'
    }
  });
});

module.exports = router;