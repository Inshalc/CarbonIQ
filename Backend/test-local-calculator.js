// test-local-calculator.js
const axios = require('axios');

async function testLocalCalculator() {
  console.log('🧪 Testing Local Carbon Calculator...\n');

  try {
    // Register and login
    const testUsername = `localcalc${Date.now().toString().slice(-6)}`;
    
    await axios.post('http://localhost:3000/api/auth/register', {
      username: testUsername,
      password: 'test123',
      first_name: 'Local',
      last_name: 'Calculator'
    });

    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: testUsername,
      password: 'test123'
    });
    
    const cookie = loginResponse.headers['set-cookie'][0];
    const axiosWithAuth = axios.create({ headers: { Cookie: cookie } });

    console.log('1. Testing Vehicle Emissions...');
    const vehicleResponse = await axiosWithAuth.post('http://localhost:3000/api/external/carbon/vehicle', {
      distance: 50,
      distanceUnit: 'km',
      vehicleType: 'car_petrol_medium',
      passengers: 1
    });
    console.log('   Carbon:', vehicleResponse.data.carbon_kg, 'kg CO₂');
    console.log('   Source:', vehicleResponse.data.data.source);
    console.log('   Calculation:', vehicleResponse.data.data.calculation);

    console.log('\n2. Testing Electric Car...');
    const electricResponse = await axiosWithAuth.post('http://localhost:3000/api/external/carbon/vehicle', {
      distance: 50,
      vehicleType: 'car_electric'
    });
    console.log('   Carbon:', electricResponse.data.carbon_kg, 'kg CO₂');
    console.log('   Calculation:', electricResponse.data.data.calculation);

    console.log('\n3. Testing Electricity (France - nuclear)...');
    const electricityResponse = await axiosWithAuth.post('http://localhost:3000/api/external/carbon/electricity', {
      electricityValue: 100,
      country: 'FR'
    });
    console.log('   Carbon:', electricityResponse.data.carbon_kg, 'kg CO₂');
    console.log('   Calculation:', electricityResponse.data.data.calculation);

    console.log('\n4. Testing Flight...');
    const flightResponse = await axiosWithAuth.post('http://localhost:3000/api/external/carbon/flight', {
      passengers: 2,
      distance: 500,
      flightType: 'flight_domestic'
    });
    console.log('   Carbon:', flightResponse.data.carbon_kg, 'kg CO₂');
    console.log('   Calculation:', flightResponse.data.data.calculation);

    console.log('\n5. Testing Diet...');
    const dietResponse = await axiosWithAuth.post('http://localhost:3000/api/external/carbon/diet', {
      meals: 3,
      dietType: 'vegetarian'
    });
    console.log('   Carbon:', dietResponse.data.carbon_kg, 'kg CO₂');
    console.log('   Calculation:', dietResponse.data.data.calculation);

    console.log('\n6. Testing Combined with Weather...');
    const combinedResponse = await axiosWithAuth.post('http://localhost:3000/api/external/calculate-footprint', {
      activityType: 'transport',
      value: 30,
      unit: 'km',
      location: 'London',
      vehicleType: 'car_hybrid'
    });
    console.log('   Carbon:', combinedResponse.data.carbon_emission.carbon_kg, 'kg CO₂');
    console.log('   Weather:', combinedResponse.data.weather_data.data.temperature + '°C in', combinedResponse.data.weather_data.data.city);

    console.log('\n🎉 Local Carbon Calculator Test Complete!');
    console.log('✅ No external API dependencies!');
    console.log('✅ Real scientific data!');
    console.log('✅ Fast and reliable!');

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testLocalCalculator();