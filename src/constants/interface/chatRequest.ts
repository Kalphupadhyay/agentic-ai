import type { Persona } from "../enum/Persona.js";

export interface ChatRequest {
  message: string;
  persona: Persona;
}
