export const InfoType = {
  CURRICULAR_UNITS: { 
    code: 'curricularUnits', 
    title: 'Unidades Curriculares',
    content: 'Seleccione la unidad curricular de interés',
    description: null // Description will be set dynamically based on mode
  },
  ASSIGN_COURSES: { 
    code: 'assignCourses', 
    title: 'Asignar cursos', 
    content: 'Asigna uno o más cursos a los docentes',
    description: 'En esta página puede asignar cursos a docentes de manera eficiente. Seleccione uno o más cursos mediante los checkboxes y asigne los docentes correspondientes. Esta función está diseñada para facilitar la gestión de asignaciones académicas.'
  },
  SELECT_ITR: { 
    code: 'selectITR', 
    title: 'Tus ITR', 
    content: 'Seleccione un ITR para acceder a sus cursos',
    description: null // Part of option-page flow
  },
  OPTION_MENU: { 
    code: 'optionMenu', 
    title: 'Menú principal', 
    content: 'Navegue por las opciones disponibles',
    description: null // Description will be set dynamically based on step
  },
  PLANNER: { 
    code: 'planner', 
    title: 'Planificador', 
    content: 'Modifica la planificación del curso actual',
    description: 'El Planificador le permite crear y gestionar la planificación semanal del curso seleccionado. Puede agregar contenidos programáticos, actividades de aprendizaje, bibliografía y definir la evaluación. También puede visualizar y gestionar el historial de cambios realizados a la planificación.'
  },
  DATA_PANEL: { 
    code: 'dataPanel', 
    title: 'Estadísticas del curso', 
    content: 'Estadísticas de cursos',
    description: 'En esta página puede visualizar estadísticas detalladas del curso seleccionado, incluyendo distribución de horas por modalidad de aprendizaje, distribución por tipo de actividad, y un análisis completo de la planificación. Los gráficos proporcionan una vista clara del balance y estructura del curso.'
  },
  EDU_BOT: { 
    code: 'eduBot', 
    title: 'Chat',
    content: 'Interactúe con el asistente educativo',
    description: 'El Asistente Educativo es una herramienta de inteligencia artificial diseñada para ayudarle en tareas académicas. Puede solicitar recomendaciones para la planificación de cursos, obtener sugerencias de actividades de aprendizaje, y recibir orientación sobre mejores prácticas pedagógicas.'
  }
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