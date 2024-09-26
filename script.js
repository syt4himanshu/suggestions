const apiKey = '36417e4de12644208a5164212242306';
const geoDBApiKey = 'c95b093f93msh30379131f06e071p1db943jsncc696ece55ae';
let selectedCrop = 'wheat';
let weatherData = null;

// Crop selector change event
document.getElementById('crop-select').addEventListener('change', (event) => {
    selectedCrop = event.target.value;
});

// Function to get weather data
async function getWeather(city) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
        if (!response.ok) throw new Error('City not found');
        weatherData = await response.json();
        displayWeatherInfo();
    } catch (error) {
        alert(error.message);
    }
}

// Function to get city suggestions
async function getCitySuggestions(query) {
    try {
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': geoDBApiKey,
                'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch city suggestions');
        const data = await response.json();
        displayCitySuggestions(data.data);
    } catch (error) {
        console.error(error.message);
    }
}

// Function to display city suggestions
function displayCitySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.textContent = `${suggestion.city}, ${suggestion.country}`;
        suggestionDiv.onclick = () => handleCitySelect(`${suggestion.city}, ${suggestion.country}`);
        suggestionsContainer.appendChild(suggestionDiv);
    });
}

// Function to handle city selection
function handleCitySelect(selectedCity) {
    document.getElementById('city-input').value = selectedCity;
    document.getElementById('suggestions').innerHTML = '';
    getWeather(selectedCity);
}

// Function to display weather info
function displayWeatherInfo() {
    const weatherInfoContainer = document.getElementById('weather-info');
    const { temp_c, humidity, wind_kph, wind_dir } = weatherData.current;
    const tips = getCropTips(temp_c, humidity, wind_kph, wind_dir);
    weatherInfoContainer.innerHTML = `
        <h2>${weatherData.location.name}, ${weatherData.location.country}</h2>
        <p>Temperature: ${temp_c}°C</p>
        <p>Condition: ${weatherData.current.condition.text}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind: ${wind_kph} kph, ${wind_dir}</p>
        <h3>Crop-Specific Tips for ${capitalizeFirstLetter(selectedCrop)}:</h3>
        <p>${tips.temperature}</p>
        <p>${tips.humidity}</p>
        <p>${tips.wind}</p>
    `;
}

// Function to get crop tips
function getCropTips(temp, humidity, windSpeed, windDir) {
    const tips = {
        wheat: {
            temperature: temp > 25 ? "High temperature. Ensure proper irrigation." : "Optimal temperature for wheat growth.",
            humidity: humidity > 70 ? "High humidity. Watch for fungal diseases." : "Favorable humidity for wheat.",
            wind: windSpeed > 20 ? "Strong winds. Protect against lodging." : "Moderate winds. Good for pollination."
        },
        rice: {
            temperature: temp > 35 ? "Very high temperature. Increase water level in paddy." : "Good temperature for rice growth.",
            humidity: humidity < 60 ? "Low humidity. Maintain standing water in field." : "Adequate humidity for rice.",
            wind: windSpeed > 15 ? "Strong winds. Check for any damage to crops." : "Mild winds. Beneficial for rice growth."
        },
        cotton: {
            temperature: temp < 20 ? "Low temperature. Protect young plants." : "Suitable temperature for cotton.",
            humidity: humidity > 80 ? "High humidity. Monitor for boll rot." : "Optimal humidity for cotton growth.",
            wind: windDir.includes('N') ? "Northerly winds. Good for cotton growth." : "Monitor wind direction for pest control."
        },
        sugarcane: {
            temperature: temp > 35 ? "High temperature. Ensure adequate irrigation." : "Favorable temperature for sugarcane.",
            humidity: humidity < 50 ? "Low humidity. Increase irrigation frequency." : "Good humidity levels for sugarcane.",
            wind: windSpeed > 25 ? "Strong winds. Check for any lodging in crop." : "Normal wind conditions for sugarcane."
        },
        soybean: {
            temperature: temp > 30 ? "High temperature. Ensure proper soil moisture." : "Optimal temperature for soybean growth.",
            humidity: humidity > 75 ? "High humidity. Watch for fungal diseases." : "Favorable humidity for soybeans.",
            wind: windSpeed > 20 ? "Strong winds. Monitor for physical damage to plants." : "Moderate winds. Good for pollination."
        }
    };
    return tips[selectedCrop];
}

// Function to capitalize first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event listeners for weather search
document.getElementById('get-weather-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        getWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});

// City input event for suggestions
document.getElementById('city-input').addEventListener('input', (event) => {
    const query = event.target.value;
    if (query.length >= 2) {
        getCitySuggestions(query);
    } else {
        document.getElementById('suggestions').innerHTML = '';
    }
});
