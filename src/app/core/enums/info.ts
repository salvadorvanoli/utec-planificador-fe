export const InfoType = {
  CURRICULAR_UNITS: { code: 'curricularUnits', title: 'Unidades Curriculares',content: 'Seleccione la unidad curricular de interés' },
  ASSIGN_COURSES: { code: 'assignCourses', title: 'Asignar cursos', content: 'Asigna uno o más cursos a los docentes' },
  SELECT_ITR: { code: 'selectITR', title: 'Tus ITR', content: 'Seleccione un ITR para acceder a sus cursos' },
  OPTION_MENU: { code: 'optionMenu', title: 'Menú principal', content: 'Navegue por las opciones disponibles' },
  PLANNER: { code: 'planner', title: 'Planificador', content: 'Modifica la planificación del curso actual' },
  DATA_PANEL: { code: 'dataPanel', title: 'Estadísticas del curso', content: 'Estadísticas de cursos' },
  EDU_BOT: { code: 'eduBot', title: 'Chat',content: 'Interactúe con el asistente educativo' }
} as const;

export type InfoTypeKey = keyof typeof InfoType;
export type InfoTypeValue = typeof InfoType[InfoTypeKey];

export const InfoTypeUtils = {
  getAll: (): InfoTypeValue[] => Object.values(InfoType),
  
  getByCode: (code: string): InfoTypeValue | undefined => 
    Object.values(InfoType).find(info => info.code === code),
  
  getCodes: (): string[] => 
    Object.values(InfoType).map(info => info.code)
};