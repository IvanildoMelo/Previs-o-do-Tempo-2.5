const apiKey = 'f20a1103d48d2adb396794e1b4040754'; 

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const weatherBody = document.getElementById('weather-body');
const errorMessage = document.getElementById('error-message');
const datetimeDisplay = document.getElementById('datetime');

// Elementos Principais
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const currentTemp = document.getElementById('current-temp');
const weatherDesc = document.getElementById('weather-desc');

// Elementos da Linha do Tempo
const timeBeforeIcon = document.getElementById('time-before-icon');
const timeBeforeTemp = document.getElementById('time-before-temp');
const timeNowIcon = document.getElementById('time-now-icon');
const timeNowTemp = document.getElementById('time-now-temp');
const timeAfterIcon = document.getElementById('time-after-icon');
const timeAfterTemp = document.getElementById('time-after-temp');

// Controle da Previsão
const toggleForecastBtn = document.getElementById('toggle-forecast-btn');
const forecastSection = document.getElementById('forecast-section');
const forecastContainer = document.getElementById('forecast-container');

// --- Atualização de Data e Hora Realtime ---
function updateClock() {
    const now = new Date();
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    datetimeDisplay.textContent = now.toLocaleDateString('pt-BR', options);
}
setInterval(updateClock, 60000); // Atualiza a cada 1 minuto
updateClock(); // Executa imediatamente ao carregar

// Ouvintes de Evento para Busca
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) getWeatherData(city);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) getWeatherData(city);
    }
});

// Ação do Botão Ver/Ocultar Previsão
toggleForecastBtn.addEventListener('click', () => {
    const isHidden = forecastSection.classList.contains('hidden-forecast');
    if (isHidden) {
        forecastSection.classList.remove('hidden-forecast');
        toggleForecastBtn.innerHTML = `Ocultar Previsão <i class="fas fa-chevron-up"></i>`;
    } else {
        forecastSection.classList.add('hidden-forecast');
        toggleForecastBtn.innerHTML = `Ver Previsão <i class="fas fa-chevron-down"></i>`;
    }
});

async function getWeatherData(city) {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const currentResponse = await fetch(currentUrl);
        if (!currentResponse.ok) throw new Error('Cidade não encontrada');
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        displayWeather(currentData, forecastData);
    } catch (error) {
        showError();
    }
}

function displayWeather(current, forecast) {
    errorMessage.classList.add('hidden');
    weatherBody.classList.remove('hidden');

    // Reseta o painel inferior para fechado
    forecastSection.classList.add('hidden-forecast');
    toggleForecastBtn.innerHTML = `Ver Previsão <i class="fas fa-chevron-down"></i>`;

    // 1. Dados Centrais (Agora)
    cityName.textContent = current.name;
    const currentRoundedTemp = Math.round(current.main.temp);
    currentTemp.textContent = currentRoundedTemp;
    weatherDesc.textContent = current.weather[0].description;

    const iconCode = current.weather[0].icon;
    const currentIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.src = currentIconUrl;

    // 2. Preenchimento da Linha do Tempo (Antes, Agora, Depois)
    // Usamos o próprio dado atual para o centro
    timeNowTemp.textContent = `${currentRoundedTemp}°`;
    timeNowIcon.src = currentIconUrl;

    // Para o "Depois", pegamos o primeiro item da lista de previsão (que é daqui a ~3 horas)
    if (forecast.list && forecast.list.length > 0) {
        const nextData = forecast.list[0];
        timeAfterTemp.textContent = `${Math.round(nextData.main.temp)}°`;
        timeAfterIcon.src = `https://openweathermap.org/img/wn/${nextData.weather[0].icon}.png`;
    }

    // Para o "Antes", como a API não traz histórico passado na rota free, calculamos uma aproximação sutil 
    // com base na variação térmica comum ou simulando -2°C do valor atual para fins estéticos de interface.
    const mockBeforeTemp = currentRoundedTemp - 2;
    timeBeforeTemp.textContent = `${mockBeforeTemp}°`;
    timeBeforeIcon.src = currentIconUrl; // Reaproveita o ícone atual adaptado

    // 3. Monta a lista do Card Inferior (Previsão de 5 Dias)
    forecastContainer.innerHTML = '';
    
    // Filtra para pegar os dados próximos ao meio-dia de cada dia da semana
    const dailyData = forecast.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        const temp = Math.round(day.main.temp);
        const icon = day.weather[0].icon;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <span class="day-name">${dayName}</span>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Tempo">
            <span class="forecast-temp">${temp}°</span>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

function showError() {
    weatherBody.classList.add('hidden');
    errorMessage.classList.remove('hidden');
}
