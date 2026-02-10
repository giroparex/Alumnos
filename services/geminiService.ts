
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

// Always use process.env.API_KEY directly when initializing the GoogleGenAI client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COURSE_OPTIONS = ["LUNES A VIERNES", "V, S Y D", "INTENSIVO 1", "INTENSIVO 2"];

export const generateSampleStudents = async (count: number = 5): Promise<Student[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera una lista de ${count} objetos de estudiantes realistas en formato JSON. Los nombres deben ser comunes en español. El campo 'photo' debe ser una cadena vacía o una URL de placeholder. Incluye dos campos de teléfono (phone1 y phone2) y un campo 'course' que debe ser uno de los siguientes valores exactos: ${COURSE_OPTIONS.join(', ')}.`,
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

  try {
    const data = JSON.parse(response.text || '[]');
    return data;
  } catch (error) {
    console.error("Error al parsear la respuesta de la IA", error);
    return [];
  }
};

export const refineStudentData = async (students: Student[]): Promise<Student[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Refina esta lista de estudiantes: estandariza nombres, verifica edades y asegura que los teléfonos tengan un formato consistente. Asegúrate de que el campo 'course' sea uno de: ${COURSE_OPTIONS.join(', ')}.
    Datos: ${JSON.stringify(students)}`,
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

  return JSON.parse(response.text || JSON.stringify(students));
};
