/**
 * Utilidad para codificar y decodificar el contexto en la URL
 * Usa Base64 para ofuscar los parámetros y hacerlos menos obvios
 */

export interface ContextParams {
  itrId: number;
  campusId: number;
  step?: string;
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

    if (typeof params.itrId !== 'number' || isNaN(params.itrId)) {
      return null;
    }

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
 * Si campusId es -1, solo codifica el itrId (para selección de campus)
 */
export function buildContextQueryParams(params: ContextParams): Record<string, string> {
  if (params.campusId === -1) {
    const itrOnlyParams = { itrId: params.itrId };
    const token = btoa(JSON.stringify(itrOnlyParams));
    const queryParams: Record<string, string> = { ctx: token };

    if (params.step) {
      queryParams['step'] = params.step;
    }

    return queryParams;
  }

  const token = encodeContext(params);
  const queryParams: Record<string, string> = { ctx: token };

  if (params.step) {
    queryParams['step'] = params.step;
  }

  return queryParams;
}

/**
 * Extrae el contexto de los query params actuales
 * SOLO acepta formato codificado (ctx)
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

    if (decoded.itrId && !decoded.campusId) {
      return {
        itrId: decoded.itrId,
        campusId: -1,
        step: queryParams['step']
      };
    }

    if (queryParams['step']) {
      return {
        ...decoded,
        step: queryParams['step']
      };
    }

    return decoded;
  } catch (error) {
    return null;
  }
}




