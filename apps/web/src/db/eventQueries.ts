// src/db/eventQueries.ts
import apiClient from '@/plugins/axios'; // Importiere den zentralen Axios-Client
import type { Event } from '@/types'; // Importiere den Event-Typ

/**
 * Holt alle Events vom Backend.
 * @returns Ein Promise, das ein Array von Event-Objekten auflöst.
 */
export async function getEvents(): Promise<Event[]> {
  try {
    // Annahme: Das Backend hat einen Endpunkt /events, der ein Array von Events zurückgibt
    const response = await apiClient.get<Event[]>('/events');
    console.log('Raw API response for events:', response.data); // Debugging-Ausgabe
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error; // Re-throw, damit die View den Fehler behandeln kann
  }
}

/**
 * Erstellt ein neues Event über das Backend.
 * @param eventData Die Daten des neuen Events.
 * @returns Ein Promise, das das erstellte Event-Objekt auflöst.
 */
export async function createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
  try {
    const response = await apiClient.post<Event>('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// Hier können weitere Funktionen wie updateEvent, deleteEvent, getEventById hinzugefügt werden
