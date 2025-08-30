const API_KEY = '4e7b9840979f6ab776e3acdf224a4682'; // Replace with your OpenWeatherMap API key
const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const weatherDisplay = document.getElementById('weatherDisplay');
const message = document.getElementById('message');

// Function to fetch weather data from the API
async function fetchWeatherData(location) {
    try {
        // Determine if location is a city name or coordinates
        let url;
        if (typeof location === 'string') {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
        } else {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}&units=metric`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '404') {
            throw new Error('City not found. Please try again.');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Function to render weather data
function renderWeather(data) {
    const { name, sys, main, weather, wind } = data;
    const weatherDescription = weather[0].description;
    const temperature = main.temp;
    const humidity = main.humidity;
    const windSpeed = wind.speed;

    weatherDisplay.innerHTML = `
        <div class="bg-blue-900 bg-opacity-50 p-6 rounded-2xl mb-6 w-full max-w-md">
            <h2 class="text-4xl font-bold mb-2">${name}, ${sys.country}</h2>
            <p class="text-lg text-gray-300 capitalize">${weatherDescription}</p>
            <div class="flex items-center justify-center my-4">
                <img src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="Weather icon" class="w-20 h-20">
                <span class="text-6xl font-extrabold">${Math.round(temperature)}°C</span>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4 w-full">
            <div class="weather-details rounded-xl p-4 text-center">
                <span class="text-2xl font-semibold">${humidity}%</span>
                <p class="text-sm text-gray-400">Humidity</p>
            </div>
            <div class="weather-details rounded-xl p-4 text-center">
                <span class="text-2xl font-semibold">${windSpeed} m/s</span>
                <p class="text-sm text-gray-400">Wind Speed</p>
            </div>
        </div>
    `;
}

// Function to handle fetching weather by location
function getWeatherByLocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    message.textContent = 'Fetching weather for your location...';
    
    fetchWeatherData({ latitude, longitude })
        .then(renderWeather)
        .catch(error => {
            message.textContent = 'Could not get weather for your location.';
            console.error(error);
        });
}

// Function to handle API key errors
function handleKeyError() {
    message.classList.add('error');
    message.textContent = 'Invalid API key or network error. Please ensure your key is correct.';
}

// Initial setup on page load
window.onload = () => {
    // Check for API key
    if (API_KEY === 'YOUR_API_KEY' || !API_KEY) {
        handleKeyError();
        searchButton.disabled = true;
        cityInput.disabled = true;
        return;
    }

    // Get user's current location on page load
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeatherByLocation, () => {
            message.textContent = 'Geolocation denied or unavailable. Please enter a city manually.';
            message.classList.remove('loading');
        });
    } else {
        message.textContent = 'Geolocation is not supported by your browser. Please enter a city manually.';
        message.classList.remove('loading');
    }
};

// Event listener for search button
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        message.textContent = 'Fetching weather for ' + city + '...';
        weatherDisplay.innerHTML = `<p class="loading">Loading...</p>`;
        fetchWeatherData(city)
            .then(renderWeather)
            .catch(error => {
                message.classList.add('error');
                message.textContent = 'Could not find weather for that city. Please try again.';
                console.error(error);
            });
    }
});

// Event listener for Enter key on the input field
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});
