import {useState} from 'react';

export default function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  function setValue(value: string | null) {
    try {
      if (value !== null) {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } else {
        setStoredValue(null);
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return [storedValue, setValue];
}
