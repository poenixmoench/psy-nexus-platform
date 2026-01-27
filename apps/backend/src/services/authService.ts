import { createUser, findUserByEmail, findUserByUsername } from '../db/userQueries'; // Korrigiert: Importiere createUser und findUserByUsername
import bcrypt from 'bcrypt'; // Importiere bcrypt für Passwort-Hashing
import jwt from 'jsonwebtoken'; // Importiere jsonwebtoken für Token-Erstellung

// Funktion zum Registrieren eines neuen Benutzers
export async function registerUser(username: string, email: string, password: string): Promise<string | null> {
  try {
    // 1. Prüfen, ob Benutzer bereits existiert (nach Username oder Email)
    const existingUserByEmail = await findUserByEmail(email);
    const existingUserByUsername = await findUserByUsername(username); // Korrigiert: Rufe die korrekte Funktion auf

    if (existingUserByEmail) {
      throw new Error('Email already exists');
    }
    if (existingUserByUsername) {
      throw new Error('Username already exists');
    }

    // 2. Passwort hashen
    const saltRounds = 10; // Empfohlener Standardwert für bcrypt
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Benutzer in der Datenbank speichern
    const createdUser = await createUser({ username, email, password: passwordHash }); const newUserId = createdUser.id; // Korrigiert: Verwende createUser und speichere die ID

    // 4. Benutzer aus der DB abrufen (um die Daten für das Token zu erhalten)
    // Da createUser die ID zurückgibt, könnten wir den Benutzer direkt mit dieser ID abrufen,
    // oder wir verlassen uns darauf, dass der Name/Email eindeutig ist und ihn direkt findet.
    // Eine direkte Abfrage nach der ID wäre effizienter. Dafür müsste createUser aber das ganze Objekt zurückgeben.
    // Für den Moment verwenden wir findUserByEmail, da wir die Email kennen.
    const foundUser = await findUserByEmail(email);
    if (!foundUser) {
      // Dieser Fall sollte nicht eintreten, wenn createUser erfolgreich war und die Transaktion konsistent ist.
      console.error('User was created but could not be found immediately afterwards.');
      return null;
    }

    // 5. JWT-Token erstellen
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined!');
      throw new Error('Server configuration error: Missing JWT secret.');
    }
    // Das Token enthält die Benutzer-ID als Claim
    const token = jwt.sign({ id: foundUser.id, email: foundUser.email, username: foundUser.username }, jwtSecret, { expiresIn: '1h' }); // Korrigiert: Schließende Klammer und Anführungszeichen hinzugefügt

    // 6. Token zurückgeben
    return token;
  } catch (error) {
    console.error('Error in registerUser service:', error);
    // Wirft den Fehler weiter hoch, damit er in der Route behandelt werden kann
    // oder gibt einen spezifischen Fehlercode zurück.
    // Hier geben wir ihn als String zurück, um die Fehlerbehandlung in der Route zu vereinfachen.
    if (error instanceof Error) {
        if (error.message === 'Email already exists' || error.message === 'Username already exists') {
            throw error; // Wirft den spezifischen Fehler weiter
        }
    }
    throw new Error('Could not register user'); // Generischer Fehler
  }
}

// Funktion zum Anmelden eines Benutzers
export async function loginUser(email: string, password: string): Promise<string | null> {
  try {
    // 1. Benutzer anhand der Email suchen
    const user = await findUserByEmail(email);
    if (!user) {
      // Wichtig: Geben Sie hier nicht zu viele Details preis (z.B. "Email not found" vs "Password incorrect"),
      // um Brute-Force-Angriffe zu erschweren.
      throw new Error('Invalid credentials'); // Generische Fehlermeldung
    }

    // 2. Eingegebenes Passwort mit dem gehashten Passwort aus der DB vergleichen
    const isPasswordValid = await bcrypt.compare(password, user.password_hash); // Stelle sicher, dass das Feld 'password_hash' heißt
    if (!isPasswordValid) {
        throw new Error('Invalid credentials'); // Generische Fehlermeldung
    }

    // 3. JWT-Token erstellen (nur wenn Passwort korrekt ist)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined!');
      throw new Error('Server configuration error: Missing JWT secret.');
    }
    // Das Token enthält die Benutzer-ID als Claim
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, jwtSecret, { expiresIn: '1h' });
    // 4. Token zurückgeben
    return token;
  } catch (error) {
    console.error('Error in loginUser service:', error);
    // Wirft den Fehler weiter hoch, damit er in der Route behandelt werden kann
    if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
            throw error; // Wirft den spezifischen Fehler weiter
        }
    }
    throw new Error('Could not log in user'); // Generischer Fehler
  }
}
