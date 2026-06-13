import React, {useState} from 'react';
import HomeScreen from './src/screens/HomeScreen';
import RawJsonScreen from './src/screens/RawJsonScreen';

type Screen = 'home' | 'raw';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'raw') {
    return <RawJsonScreen onBack={() => setScreen('home')} />;
  }

  return <HomeScreen onNavigateToRaw={() => setScreen('raw')} />;
}
