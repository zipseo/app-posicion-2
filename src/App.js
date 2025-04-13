
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [ubicacion, setUbicacion] = useState('');
  const [palabraClave, setPalabraClave] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [resultados, setResultados] = useState([]);

  const obtenerCoordenadas = async (direccion) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'MiAppPosicionamiento/1.0'
      }
    });
    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat, lon };
    } else {
      throw new Error("Ubicación no encontrada.");
    }
  };

  const buscarEnGoogleMaps = async (consulta, coordenadas) => {
    const params = {
      engine: "google_maps",
      type: "search",
      q: consulta,
      hl: "es",
      ll: `@${coordenadas.lat},${coordenadas.lon},15z`,
      api_key: "ba5368f21d52a41a8e43cb66f2a4400b67dc6b8a0996e45252a4c152b06e2014"
    };

    const { data } = await axios.get("https://serpapi.com/search", { params });
    if (data.local_results) {
      return data.local_results.map((item, index) => ({
        nombre: item.title,
        direccion: item.address,
        posicion: index + 1
      }));
    } else {
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const consulta = `${palabraClave} en ${ciudad}`;
    try {
      const coords = await obtenerCoordenadas(ubicacion);
      const resultados = await buscarEnGoogleMaps(consulta, coords);
      setResultados(resultados);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const getColor = (posicion) => {
    if (posicion <= 5) return "lightgreen";
    if (posicion <= 12) return "orange";
    return "lightcoral";
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Simulador de Posicionamiento Local</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>📍 Desde dónde se simula la búsqueda:</label><br/>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: Urquiza 904, Campana"
            required
          />
        </div>
        <div>
          <label>🔎 Palabra clave:</label><br/>
          <input
            type="text"
            value={palabraClave}
            onChange={(e) => setPalabraClave(e.target.value)}
            placeholder="Ej: pizzería"
            required
          />
        </div>
        <div>
          <label>🏙️ Ciudad objetivo:</label><br/>
          <input
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej: Zárate"
            required
          />
        </div>
        <br/>
        <button type="submit">Buscar</button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3>Resultados:</h3>
        {resultados.map((r, i) => (
          <div key={i} style={{ backgroundColor: getColor(r.posicion), margin: '0.5rem 0', padding: '1rem' }}>
            <strong>#{r.posicion}</strong> - {r.nombre} <br/>
            <small>{r.direccion}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
