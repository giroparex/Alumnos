
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const getApiKey = () => {
  try {
    // Intentamos obtener la clave de las variables de entorno si existen
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const apiKey = getApiKey();
// Inicializamos la IA solo si tenemos la clave, si no, devolvemos null de forma segura
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const COURSE_OPTIONS = ["LUNES A VIERNES", "V, S Y D", "INTENSIVO 1", "INTENSIVO 2"];

export const generateSampleStudents = async (count: number = 5): Promise<Student[]> => {
  if (!ai) {
    console.warn("IA no disponible: No se encontró API_KEY");
    throw new Error("La función de IA requiere una API Key configurada en el servidor.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una lista de ${count} objetos de estudiantes en formato JSON. Cursos disponibles: ${COURSE_OPTIONS.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              age: { type: Type.NUMBER },
              email: { type: Type.STRING },
              phone1: { type: Type.STRING },
              phone2: { type: Type.STRING },
              course: { type: Type.STRING, enum: COURSE_OPTIONS },
              photo: { type: Type.STRING },
            },
            required: ["id", "name", "age", "email", "phone1", "phone2", "course"],
          },
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error en Gemini:", error);
    return [];
  }
};

export const refineStudentData = async (students: Student[]): Promise<Student[]> => {
  if (!ai) return students;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Limpia y profesionaliza los nombres y datos de este JSON de estudiantes: ${JSON.stringify(students)}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || JSON.stringify(students));
  } catch (error) {
    return students;
  }
};
