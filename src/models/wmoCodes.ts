export interface WmoInfo {
  description: string;
  dayEmoji: string;
  nightEmoji: string;
  dayColor: string;
  nightColor: string;
}

const wmoCodes: Record<number, WmoInfo> = {
  0: {
    description: 'Clear Sky',
    dayEmoji: '☀️',
    nightEmoji: '🌙',
    dayColor: '#FFC107',
    nightColor: '#90CAF9',
  },
  1: {
    description: 'Mainly Clear',
    dayEmoji: '🌤️',
    nightEmoji: '🌙',
    dayColor: '#FFC107',
    nightColor: '#90CAF9',
  },
  2: {
    description: 'Partly Cloudy',
    dayEmoji: '⛅',
    nightEmoji: '☁️',
    dayColor: '#FFD54F',
    nightColor: '#B0BEC5',
  },
  3: {
    description: 'Overcast',
    dayEmoji: '☁️',
    nightEmoji: '☁️',
    dayColor: '#B0BEC5',
    nightColor: '#B0BEC5',
  },
  45: {
    description: 'Foggy',
    dayEmoji: '🌫️',
    nightEmoji: '🌫️',
    dayColor: '#B0BEC5',
    nightColor: '#B0BEC5',
  },
  48: {
    description: 'Depositing Rime Fog',
    dayEmoji: '🌫️',
    nightEmoji: '🌫️',
    dayColor: '#B0BEC5',
    nightColor: '#B0BEC5',
  },
  51: {
    description: 'Light Drizzle',
    dayEmoji: '🌦️',
    nightEmoji: '🌧️',
    dayColor: '#81D4FA',
    nightColor: '#81D4FA',
  },
  53: {
    description: 'Moderate Drizzle',
    dayEmoji: '🌧️',
    nightEmoji: '🌧️',
    dayColor: '#4FC3F7',
    nightColor: '#4FC3F7',
  },
  55: {
    description: 'Dense Drizzle',
    dayEmoji: '🌧️',
    nightEmoji: '🌧️',
    dayColor: '#29B6F6',
    nightColor: '#29B6F6',
  },
  56: {
    description: 'Freezing Drizzle',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#80DEEA',
    nightColor: '#80DEEA',
  },
  57: {
    description: 'Heavy Freezing Drizzle',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#4DD0E1',
    nightColor: '#4DD0E1',
  },
  61: {
    description: 'Slight Rain',
    dayEmoji: '🌧️',
    nightEmoji: '🌧️',
    dayColor: '#4FC3F7',
    nightColor: '#4FC3F7',
  },
  63: {
    description: 'Moderate Rain',
    dayEmoji: '🌧️',
    nightEmoji: '🌧️',
    dayColor: '#29B6F6',
    nightColor: '#29B6F6',
  },
  65: {
    description: 'Heavy Rain',
    dayEmoji: '🌧️',
    nightEmoji: '🌧️',
    dayColor: '#039BE5',
    nightColor: '#039BE5',
  },
  66: {
    description: 'Freezing Rain',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#80DEEA',
    nightColor: '#80DEEA',
  },
  67: {
    description: 'Heavy Freezing Rain',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#4DD0E1',
    nightColor: '#4DD0E1',
  },
  71: {
    description: 'Slight Snow',
    dayEmoji: '❄️',
    nightEmoji: '❄️',
    dayColor: '#E0E0E0',
    nightColor: '#E0E0E0',
  },
  73: {
    description: 'Moderate Snow',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#E0E0E0',
    nightColor: '#E0E0E0',
  },
  75: {
    description: 'Heavy Snow',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#BDBDBD',
    nightColor: '#BDBDBD',
  },
  77: {
    description: 'Snow Grains',
    dayEmoji: '❄️',
    nightEmoji: '❄️',
    dayColor: '#E0E0E0',
    nightColor: '#E0E0E0',
  },
  80: {
    description: 'Slight Showers',
    dayEmoji: '🌦️',
    nightEmoji: '🌧️',
    dayColor: '#4FC3F7',
    nightColor: '#4FC3F7',
  },
  81: {
    description: 'Moderate Showers',
    dayEmoji: '🌧️',
    nightEmoji: '🌧️',
    dayColor: '#29B6F6',
    nightColor: '#29B6F6',
  },
  82: {
    description: 'Violent Showers',
    dayEmoji: '⛈️',
    nightEmoji: '⛈️',
    dayColor: '#7E57C2',
    nightColor: '#7E57C2',
  },
  85: {
    description: 'Slight Snow Showers',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#E0E0E0',
    nightColor: '#E0E0E0',
  },
  86: {
    description: 'Heavy Snow Showers',
    dayEmoji: '🌨️',
    nightEmoji: '🌨️',
    dayColor: '#BDBDBD',
    nightColor: '#BDBDBD',
  },
  95: {
    description: 'Thunderstorm',
    dayEmoji: '⛈️',
    nightEmoji: '⛈️',
    dayColor: '#7E57C2',
    nightColor: '#7E57C2',
  },
  96: {
    description: 'Thunderstorm w/ Hail',
    dayEmoji: '⛈️',
    nightEmoji: '⛈️',
    dayColor: '#7E57C2',
    nightColor: '#7E57C2',
  },
  99: {
    description: 'Thunderstorm w/ Heavy Hail',
    dayEmoji: '⛈️',
    nightEmoji: '⛈️',
    dayColor: '#7E57C2',
    nightColor: '#7E57C2',
  },
};

export function getWmoInfo(code: number): WmoInfo {
  return wmoCodes[code] ?? wmoCodes[0]!;
}

export default wmoCodes;
