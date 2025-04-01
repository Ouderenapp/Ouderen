import React, { useEffect } from 'react';

function App() {
  // Functie om database informatie op te halen
  const fetchDatabaseInfo = async () => {
    try {
      const response = await fetch('/api/db-info');
      const data = await response.json();
      console.log('Database Verbinding:', {
        Database: data.database,
        Gebruiker: data.user,
        Host: data.host,
        PostgreSQL Versie: data.version,
        Verbonden op: new Date(data.timestamp).toLocaleString()
      });
    } catch (error) {
      console.error('Fout bij ophalen database informatie:', error);
    }
  };

  // Roep de functie aan bij het laden van de app
  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  return (
    // ... existing code ...
  );
}

export default App; 