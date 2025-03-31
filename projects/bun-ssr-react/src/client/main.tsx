import { hydrateRoot } from 'react-dom/client';
import App from './components/app';
import { WeatherProvider } from './server-components/weather-provider';

// Function to initialize the client-side app
function initApp() {
  // Get the root element
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Could not find root element');
    return;
  }

  // Parse the initial data that was serialized by the server
  let initialWeatherData = null;
  try {
    const initialDataScript = document.getElementById('__INITIAL_DATA__');
    if (initialDataScript?.textContent) {
      const parsedData = JSON.parse(initialDataScript.textContent);
      initialWeatherData = parsedData.weatherData;
      console.log('Hydrating with initial data:', initialWeatherData);
    }
  } catch (error) {
    console.error('Failed to parse initial data:', error);
  }

  // Hydrate the application with the initial data from the server
  hydrateRoot(
    rootElement,
    <WeatherProvider initialData={initialWeatherData}>
      <App />
    </WeatherProvider>,
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
