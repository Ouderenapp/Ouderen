# Gebruik van BuurtConnect PNG's op Vercel

Voor gebruik op Vercel worden de volgende aanbevelingen gedaan:

## Aanbevolen aanpak

1. **Gebruik relatieve paden vanaf de root**
   ```jsx
   <img src="/images/png-bestanden/buurtconnect-logo-300x100.png" alt="BuurtConnect" />
   ```

2. **Zorg dat de PNG-bestanden correct in de map staan**
   - Plaats de PNG-bestanden direct in deze map
   - Alle bestanden moeten de juiste naam hebben zoals beschreven in README.md

3. **Gebruik Next/Image component (indien Next.js wordt gebruikt)**
   ```jsx
   import Image from 'next/image'
   
   <Image 
     src="/images/png-bestanden/buurtconnect-logo-300x100.png"
     alt="BuurtConnect"
     width={300}
     height={100}
   />
   ```

## Problemen oplossen

Als de PNG-bestanden niet correct worden weergegeven op Vercel:

1. Controleer of de bestandsnamen exact overeenkomen
2. Zorg dat de bestanden zijn geüpload naar de juiste map
3. Probeer een harde refresh (Ctrl+F5) om caching problemen te voorkomen
4. Inspecteer de browser console voor fouten

## Best practices voor afbeeldingen op Vercel

- Gebruik de kleinst mogelijke bestandsgrootte die nog steeds goede kwaliteit biedt
- Overweeg het gebruik van Next/Image voor automatische optimalisatie (als je Next.js gebruikt)
- Zorg ervoor dat de bestanden in de public map staan 