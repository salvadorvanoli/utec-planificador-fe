/**
 * Utilidad para codificar y decodificar el contexto en la URL
 * Usa Base64 para ofuscar los parámetros y hacerlos menos obvios
 */

export interface ContextParams {
  itrId?: number;
  campusId?: number;
  step?: string;
  isEdit?: boolean;
  courseId?: number;
  mode?: string;
}

/**
 * Codifica los parámetros del contexto en un token Base64
 */
export function encodeContext(params: ContextParams): string {
  try {
    const json = JSON.stringify(params);
    return btoa(json);
  } catch (error) {
    console.error('Error encoding context:', error);
    return '';
  }
}

/**
 * Decodifica un token Base64 a los parámetros del contexto
 */
export function decodeContext(token: string): ContextParams | null {
  try {
    if (!token || token.trim() === '') {
      return null;
    }

    const json = atob(token);
    const params = JSON.parse(json);

    if (!params || typeof params !== 'object') {
      return null;
    }

    // Validar itrId si está presente
    if (params.itrId !== undefined) {
      if (typeof params.itrId !== 'number' || isNaN(params.itrId)) {
        return null;
      }
    }

    // Validar campusId si está presente
    if (params.campusId !== undefined) {
      if (typeof params.campusId !== 'number' || isNaN(params.campusId)) {
        return null;
      }
    }

    return params;
  } catch (error) {
    return null;
  }
}

/**
 * Construye los query params con el contexto codificado
 * TODOS los parámetros se codifican dentro del token ctx para seguridad
 */
export function buildContextQueryParams(params: ContextParams): Record<string, string> {
  // Construir objeto con todos los parámetros que se deben codificar
  const paramsToEncode: ContextParams = {};

  // Agregar itrId y campusId si están presentes
  if (params.itrId !== undefined) {
    paramsToEncode.itrId = params.itrId;
  }

  if (params.campusId !== undefined) {
    paramsToEncode.campusId = params.campusId;
  }

  // Agregar parámetros opcionales si están presentes
  if (params.step !== undefined) {
    paramsToEncode.step = params.step;
  }

  if (params.isEdit !== undefined) {
    paramsToEncode.isEdit = params.isEdit;
  }

  if (params.courseId !== undefined) {
    paramsToEncode.courseId = params.courseId;
  }

  if (params.mode !== undefined) {
    paramsToEncode.mode = params.mode;
  }

  // Codificar todo en el token ctx
  const token = encodeContext(paramsToEncode);
  return { ctx: token };
}

/**
 * Extrae el contexto de los query params actuales
 * SOLO acepta formato codificado (ctx)
 * Todos los parámetros están codificados dentro del token por seguridad
 * Retorna null si el token es inválido o corrupto
 */
export function extractContextFromUrl(queryParams: Record<string, any>): ContextParams | null {
  try {
    if (!queryParams['ctx']) {
      return null;
    }

    const decoded = decodeContext(queryParams['ctx']);

    if (!decoded) {
      return null;
    }

    // El token contiene todos los parámetros codificados
    return decoded;
  } catch (error) {
    return null;
  }
}




