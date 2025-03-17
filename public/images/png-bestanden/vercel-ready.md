# Vercel-Ready BuurtConnect Afbeeldingen

Voor direct gebruik op Vercel (of andere hosting-omgevingen) zonder PNG-bestanden te hoeven genereren, kun je de volgende aanpak gebruiken.

## Base64-encoded klein logo (direct bruikbaar)

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABQElEQVR4nO2Wv0oDQRDGv5ASRKz0BSwEEVEbC5+gImljIYiksrCy8QXESq1S+Qg+gIVIkICkCihWgoKFjWih2PyuOImQs3I37C7mYD84uLvZ+Wbu9mYGOHI4qAD4QTJPRIcoAjgC8OVYUcuIFzMkPwDeALwCeCG5SrIYhXSRZFv5LwCvSVoA5zXEPUkbpKu8Vv6NsZYMydcIYk9p6qe9AFxokHYBzDDLI0g9cSJ98FKbkbzVINPjYKfDRj2a1VjXsVgEcOxBNutjTlzYYP6vrMT3O6Q6FBrPIqmSXAqZsJ44NfK18lrGWhPAR0jBk6Qzxj36h5DXlL+nsw9C+vD4JWvNABgFcBdCfKt1UpJ1APsAnkMk+M3ZaYWaU3QkGRr5Rc5OoTQBjLhnIgbDY/2dL8n5ZGTkawkmbkQ5YDFJSRx/nF0G7rXZjcTdyQAAAABJRU5ErkJggg==" alt="BuurtConnect" />
```

## Hoe te gebruiken

### 1. Directe HTML

Kopieer en plak de bovenstaande HTML-code in je component of webpagina.

### 2. In React/Next.js

```jsx
function Logo() {
  return (
    <img 
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABQElEQVR4nO2Wv0oDQRDGv5ASRKz0BSwEEVEbC5+gImljIYiksrCy8QXESq1S+Qg+gIVIkICkCihWgoKFjWih2PyuOImQs3I37C7mYD84uLvZ+Wbu9mYGOHI4qAD4QTJPRIcoAjgC8OVYUcuIFzMkPwDeALwCeCG5SrIYhXSRZFv5LwCvSVoA5zXEPUkbpKu8Vv6NsZYMydcIYk9p6qe9AFxokHYBzDDLI0g9cSJ98FKbkbzVINPjYKfDRj2a1VjXsVgEcOxBNutjTlzYYP6vrMT3O6Q6FBrPIqmSXAqZsJ44NfK18lrGWhPAR0jBk6Qzxj36h5DXlL+nsw9C+vD4JWvNABgFcBdCfKt1UpJ1APsAnkMk+M3ZaYWaU3QkGRr5Rc5OoTQBjLhnIgbDY/2dL8n5ZGTkawkmbkQ5YDFJSRx/nF0G7rXZjcTdyQAAAABJRU5ErkJggg==" 
      alt="BuurtConnect"
      style={{ width: "30px", height: "30px" }}
    />
  )
}

export default Logo;
```

### 3. In CSS

```css
.logo {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABQElEQVR4nO2Wv0oDQRDGv5ASRKz0BSwEEVEbC5+gImljIYiksrCy8QXESq1S+Qg+gIVIkICkCihWgoKFjWih2PyuOImQs3I37C7mYD84uLvZ+Wbu9mYGOHI4qAD4QTJPRIcoAjgC8OVYUcuIFzMkPwDeALwCeCG5SrIYhXSRZFv5LwCvSVoA5zXEPUkbpKu8Vv6NsZYMydcIYk9p6qe9AFxokHYBzDDLI0g9cSJ98FKbkbzVINPjYKfDRj2a1VjXsVgEcOxBNutjTlzYYP6vrMT3O6Q6FBrPIqmSXAqZsJ44NfK18lrGWhPAR0jBk6Qzxj36h5DXlL+nsw9C+vD4JWvNABgFcBdCfKt1UpJ1APsAnkMk+M3ZaYWaU3QkGRr5Rc5OoTQBjLhnIgbDY/2dL8n5ZGTkawkmbkQ5YDFJSRx/nF0G7rXZjcTdyQAAAABJRU5ErkJggg==");
  width: 30px;
  height: 30px;
  background-size: contain;
  background-repeat: no-repeat;
}
```

```html
<div class="logo"></div>
```

## Voordelen van deze aanpak

1. **Direct bruikbaar** - Geen bestandsverwerking nodig
2. **Werkt gegarandeerd op Vercel** - Geen problemen met bestandspaden
3. **Geen extra HTTP-requests** - De afbeelding is direct in de code
4. **Klein icoon** - Dit is een geoptimaliseerde kleine versie van het logo-icoon

*Opmerking: Voor grotere afbeeldingen raden we nog steeds aan om de PNG-bestanden te gebruiken, aangezien base64-encoding de bestandsgrootte vergroot.* 