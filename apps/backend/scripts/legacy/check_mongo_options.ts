import { MongoClient } from 'mongodb';

const CONNECTION_STRING = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name'; // Ersetze durch deine URI

async function checkDefaultOptions() {
  console.log("Erstelle MongoClient mit Standardoptionen...");
  const client = new MongoClient(CONNECTION_STRING);

  // Die Standardoptionen sind in der MongoDB Node.js Driver Dokumentation beschrieben.
  // Hier fuegen wir einige explizit hinzu, um sie zu verdeutlichen.
  // Die tatsaechlichen Standardwerte findest du in der offiziellen Dokumentation:
  // https://mongodb.github.io/node-mongodb-native/6.3/interfaces/MongoClientOptions/

  // Beispiel fuer einige relevante Standardoptionen (Standardeinstellungen):
  const defaultOptions = {
    // Connection Pooling:
    maxPoolSize: 10,          // Standard: 10
    minPoolSize: 5,           // Standard: 5 (nur ab bestimmter Version)
    maxIdleTimeMS: 30000,     // Standard: 30000 ms (30 Sekunden)
    waitQueueTimeoutMS: 30000, // Standard: 30000 ms (30 Sekunden)

    // Server Selection:
    serverSelectionTimeoutMS: 30000, // Standard: 30000 ms (30 Sekunden)
    heartbeatFrequencyMS: 10000,     // Standard: 10000 ms (10 Sekunden)

    // Andere:
    // useNewUrlParser: true, // Veraltet, wird immer benutzt
    // useUnifiedTopology: true, // Veraltet, ist immer aktiv
  };

  console.log("Standard-Optionen fuer Connection Pooling und Server Selection:");
  console.log(JSON.stringify(defaultOptions, null, 2));

  try {
    console.log("Verbinde zum Server...");
    await client.connect();
    console.log("Verbunden!");

    // Hole Server-Status fuer weitere Details
    const adminDb = client.db().admin();
    const serverStatus = await adminDb.serverStatus();
    console.log("\nServer Status (Teilinformationen):");
    console.log("- Host:", serverStatus.host);
    console.log("- Connections (current/available):", serverStatus.connections.current, "/", serverStatus.connections.available);

    // Hole Informationen ueber den Pool der aktuellen Client-Instanz
    // Hinweis: Die genauen Details des internen Pools sind nicht direkt ueber die API verfuegbar,
    // aber du kannst die Connection-Details aus dem Server-Status nutzen.
    console.log("\n--- Analyse ---");
    console.log("Max Pool Size (Standard):", defaultOptions.maxPoolSize);
    console.log("Min Pool Size (Standard):", defaultOptions.minPoolSize);
    console.log("Aktuelle Connections laut Server:", serverStatus.connections.current);

    if (serverStatus.connections.current >= defaultOptions.maxPoolSize) {
      console.log("WARNUNG: Aktuelle Connections erreichen oder ueberschreiten maxPoolSize. Betrachte Erhoehung von maxPoolSize.");
    } else {
      console.log("INFO: Aktuelle Connections sind unterhalb von maxPoolSize. Standardwert ist fuer diese Last wahrscheinlich ausreichend.");
    }

  } catch (err) {
    console.error("Fehler bei der Verbindung:", err);
  } finally {
    await client.close();
    console.log("\nVerbindung geschlossen.");
  }
}

checkDefaultOptions();
