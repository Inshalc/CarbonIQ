// services/enhancedCarbonCalculator.js
class EnhancedCarbonCalculator {
  constructor() {
    // Based on EPA, IPCC, and other scientific sources
    this.emissionFactors = {
      transport: {
        // Road transport (kg CO2 per km)
        car_petrol_small: 0.15,
        car_petrol_medium: 0.19,
        car_petrol_large: 0.25,
        car_diesel_small: 0.13,
        car_diesel_medium: 0.17,
        car_diesel_large: 0.22,
        car_hybrid: 0.11,
        car_electric: 0.05, // Varies by electricity source
        motorcycle: 0.11,
        bus: 0.09,
        train_electric: 0.04,
        train_diesel: 0.06,
        
        // Air transport (kg CO2 per km per passenger)
        flight_domestic: 0.25,
        flight_short_haul: 0.18,
        flight_long_haul: 0.15
      },
      
      electricity: {
        // kg CO2 per kWh (varies by energy mix)
        US: 0.429,
        CA: 0.130,
        GB: 0.233,
        DE: 0.408,
        FR: 0.058,  // Nuclear-heavy
        CN: 0.681,
        IN: 0.820,
        AU: 0.790,
        BR: 0.090,  // Hydro-heavy
        world_average: 0.475
      },
      
      diet: {
        // kg CO2 per meal
        beef_heavy: 3.5,
        meat_heavy: 2.5,
        average: 1.8,
        vegetarian: 0.9,
        vegan: 0.7
      },
      
      household: {
        // kg CO2 per unit
        natural_gas_per_kwh: 0.2,
        heating_oil_per_liter: 2.7,
        propane_per_liter: 1.5,
        water_per_cubic_meter: 0.34
      }
    };
  }

  calculateTransport(distance, unit = 'km', vehicleType = 'car_petrol_medium', passengers = 1) {
    const distanceKm = unit === 'miles' ? distance * 1.60934 : distance;
    const emissionFactor = this.emissionFactors.transport[vehicleType] || 0.19;
    
    // Adjust for passenger load
    const effectiveEmission = vehicleType.includes('flight') ? 
      emissionFactor : emissionFactor / passengers;
    
    const carbonKg = distanceKm * effectiveEmission;
    
    return {
      success: true,
      carbon_kg: parseFloat(carbonKg.toFixed(3)),
      data: {
        activity: 'transport',
        distance_km: parseFloat(distanceKm.toFixed(2)),
        vehicle_type: vehicleType,
        passengers: passengers,
        emission_factor: emissionFactor,
        calculation: `${distanceKm} km × ${emissionFactor} kg CO2/km`,
        source: 'scientific_data'
      }
    };
  }

  calculateElectricity(usage, unit = 'kwh', country = 'US') {
    const emissionFactor = this.emissionFactors.electricity[country] || this.emissionFactors.electricity.world_average;
    const carbonKg = usage * emissionFactor;
    
    return {
      success: true,
      carbon_kg: parseFloat(carbonKg.toFixed(3)),
      data: {
        activity: 'electricity',
        usage: usage,
        unit: unit,
        country: country,
        emission_factor: emissionFactor,
        calculation: `${usage} kWh × ${emissionFactor} kg CO2/kWh`,
        source: 'scientific_data'
      }
    };
  }

  calculateFlight(passengers, distance, unit = 'km', flightType = 'flight_domestic') {
    const distanceKm = unit === 'miles' ? distance * 1.60934 : distance;
    const emissionFactor = this.emissionFactors.transport[flightType] || 0.25;
    const carbonKg = distanceKm * passengers * emissionFactor;
    
    return {
      success: true,
      carbon_kg: parseFloat(carbonKg.toFixed(3)),
      data: {
        activity: 'flight',
        distance_km: parseFloat(distanceKm.toFixed(2)),
        passengers: passengers,
        flight_type: flightType,
        emission_factor: emissionFactor,
        calculation: `${distanceKm} km × ${passengers} passengers × ${emissionFactor} kg CO2/km`,
        source: 'scientific_data'
      }
    };
  }

  calculateDiet(meals, dietType = 'average') {
    const emissionFactor = this.emissionFactors.diet[dietType] || 1.8;
    const carbonKg = meals * emissionFactor;
    
    return {
      success: true,
      carbon_kg: parseFloat(carbonKg.toFixed(3)),
      data: {
        activity: 'diet',
        meals: meals,
        diet_type: dietType,
        emission_factor: emissionFactor,
        calculation: `${meals} meals × ${emissionFactor} kg CO2/meal`,
        source: 'scientific_data'
      }
    };
  }

  // Comprehensive footprint calculation
  calculateDailyFootprint(activities) {
    let totalEmission = 0;
    const breakdown = [];
    
    activities.forEach(activity => {
      let result;
      
      switch(activity.type) {
        case 'transport':
          result = this.calculateTransport(
            activity.distance, 
            activity.unit, 
            activity.vehicleType, 
            activity.passengers
          );
          break;
        case 'electricity':
          result = this.calculateElectricity(
            activity.usage,
            activity.unit,
            activity.country
          );
          break;
        case 'flight':
          result = this.calculateFlight(
            activity.passengers,
            activity.distance,
            activity.unit,
            activity.flightType
          );
          break;
        case 'diet':
          result = this.calculateDiet(
            activity.meals,
            activity.dietType
          );
          break;
        default:
          result = { carbon_kg: 0, data: { activity: 'unknown' } };
      }
      
      totalEmission += result.carbon_kg;
      breakdown.push({
        type: activity.type,
        carbon_kg: result.carbon_kg,
        details: result.data
      });
    });
    
    return {
      success: true,
      total_carbon_kg: parseFloat(totalEmission.toFixed(3)),
      breakdown: breakdown,
      equivalent_trees: parseFloat((totalEmission / 21.77).toFixed(1)) // kg CO2 absorbed by one tree per year
    };
  }

  getEmissionFactors() {
    return this.emissionFactors;
  }
}

module.exports = EnhancedCarbonCalculator;