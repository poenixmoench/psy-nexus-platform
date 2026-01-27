import mongoose, { Schema, Document } from 'mongoose';

// Typdefinition für ein Agenten-Dokument
interface IAgent extends Document {
  id: string; // z.B. 'orion'
  shortId: string; // z.B. 'ORI'
  name: string; // z.B. 'ORION'
  role: string; // z.B. 'Strategische Leitung'
  icon: string; // z.B. 'Cpu'
  color: string; // z.B. '#00f2ff'
  status: string; // z.B. 'ready', 'active', 'idle', 'offline'
  lastActive: Date; // Datum/Uhrzeit des letzten Kontakts
}

// Schema-Definition
const AgentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true }, // Primärschlüssel
  shortId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  status: { type: String, default: 'offline' },
  lastActive: { type: Date, default: Date.now }
});

// Index für effiziente Suche nach ID
AgentSchema.index({ id: 1 });

// Modell exportieren
export const AgentModel = mongoose.model<IAgent>('Agent', AgentSchema);
