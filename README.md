# Skydd

## Naiutilus Sjø X Høyskolen Kristiania, Bachelor Prosjekt

Dette prosjektet er en app som er utviklet som en bacheloroppgave i sammarbeid med vår oppdragsgiver Nautilus Sjø.

## Arbeidsflyt fra expo for å kjøre appen lokalt

1. Installer dependencies

   ```bash
   npm install
   ```

2. Start appen via terminal

   ```bash
    npx expo start
   ```

   alternativt start appen med tunnel for å kjøre via internett

   ```bash
    npx expo start --tunnel
   ```

3. Åpne appen

   - For Android og iOS, skan QR kode med telefonens kamera.
   - Husk å laste ned Expo Go appen fra App Store eller Google Play.
  
## Firebase-konfigurasjon
Appen bruker Firebase til autentisering og datalagring. For at appen skal fungere må du legge inn en gyldig Firebase-konfigurasjon.

1. Opprett firebaseConfig.ts-fil

2. Fyll inn verdiene
   ```bash
	  const firebaseConfig = {
		  apiKey: "DIN_API_KEY",
		  authDomain: "DITT_PROSJEKT.firebaseapp.com",
		  databaseURL: "https://DITT_PROSJEKT-default-rtdb.europe-west1.firebasedatabase.app",
		  projectId: "DITT_PROSJEKT",
		  storageBucket: "DITT_PROSJEKT.appspot.com",
		  messagingSenderId: "DIN_ID",
		  appId: "DIN_APP_ID",
	};

	export default firebaseConfig;
   ```


