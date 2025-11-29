import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CourseService } from './course.service';
import { Course, CourseBasicResponse, CourseRequest, PageResponse, PeriodResponse } from '../models';
import { environment } from '../../../environments/environment';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/courses`;

  const mockCourse: Course = {
    id: 1,
    shift: 'MORNING',
    description: 'Programación I',
    startDate: '2025-03-01',
    endDate: '2025-07-31',
    partialGradingSystem: 'STANDARD',
    hoursPerDeliveryFormat: {},
    isRelatedToInvestigation: false,
    involvesActivitiesWithProductiveSector: false,
    sustainableDevelopmentGoals: [],
    universalDesignLearningPrinciples: [],
    curricularUnit: {
      id: 1,
      name: 'Programación I',
      credits: 4,
      domainAreas: ['COMPUTING'],
      professionalCompetencies: ['PROBLEM_SOLVING'],
      term: {
        id: 1,
        number: 1,
        program: {
          id: 1,
          name: 'Ingeniería en Sistemas',
          durationInTerms: 8,
          totalCredits: 240
        }
      }
    },
    teachers: [
      {
        id: 1,
        fullName: 'Juan Pérez',
        email: 'juan.perez@utec.edu.uy'
      }
    ]
  };

  const mockCourseRequest: CourseRequest = {
    shift: 'MORNING',
    description: 'Programación I',
    startDate: '2025-03-01',
    endDate: '2025-07-31',
    partialGradingSystem: 'STANDARD',
    hoursPerDeliveryFormat: {},
    isRelatedToInvestigation: false,
    involvesActivitiesWithProductiveSector: false,
    sustainableDevelopmentGoals: [],
    universalDesignLearningPrinciples: [],
    curricularUnitId: 1,
    userIds: [1]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CourseService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCourse', () => {
    it('should send POST request to create a course', (done) => {
      service.createCourse(mockCourseRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCourseRequest);
      req.flush(mockCourse);
    });

    it('should handle error when creating course fails', (done) => {
      service.createCourse(mockCourseRequest).subscribe({
        error: (error: any) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getCourseById', () => {
    it('should send GET request to fetch course by ID', (done) => {
      const courseId = 1;

      service.getCourseById(courseId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCourse);
    });

    it('should handle 404 error when course not found', (done) => {
      const courseId = 999;

      service.getCourseById(courseId).subscribe({
        error: (error: any) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateCourse', () => {
    it('should send PUT request to update course', (done) => {
      const courseId = 1;

      service.updateCourse(courseId, mockCourseRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockCourseRequest);
      req.flush(mockCourse);
    });
  });

  describe('deleteCourse', () => {
    it('should send DELETE request to remove course', (done) => {
      const courseId = 1;

      service.deleteCourse(courseId).subscribe({
        next: () => {
          expect().nothing();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Sustainable Development Goals', () => {
    it('should add SDG to course', (done) => {
      const courseId = 1;
      const goal = 'QUALITY_EDUCATION';

      service.addSustainableDevelopmentGoal(courseId, goal).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}/sustainable-development-goals/${goal}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockCourse);
    });

    it('should delete SDG from course', (done) => {
      const courseId = 1;
      const goal = 'QUALITY_EDUCATION';

      service.deleteSustainableDevelopmentGoal(courseId, goal).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}/sustainable-development-goals/${goal}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockCourse);
    });
  });

  describe('Universal Design Learning Principles', () => {
    it('should add UDL principle to course', (done) => {
      const courseId = 1;
      const principle = 'MULTIPLE_MEANS_OF_REPRESENTATION';

      service.addUniversalDesignLearningPrinciple(courseId, principle).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}/universal-design-learning-principles/${principle}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockCourse);
    });

    it('should delete UDL principle from course', (done) => {
      const courseId = 1;
      const principle = 'MULTIPLE_MEANS_OF_REPRESENTATION';

      service.deleteUniversalDesignLearningPrinciple(courseId, principle).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}/universal-design-learning-principles/${principle}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockCourse);
    });
  });

  describe('updatePartialGradingSystem', () => {
    it('should send PATCH request to update partial grading system', (done) => {
      const courseId = 1;
      const partialGradingSystem = 'WEIGHTED';

      service.updatePartialGradingSystem(courseId, partialGradingSystem).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}/partial-grading-system`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ partialGradingSystem });
      req.flush(mockCourse);
    });
  });

  describe('updateHoursPerDeliveryFormat', () => {
    it('should send PATCH request to update hours per delivery format', (done) => {
      const courseId = 1;
      const hoursPerDeliveryFormat = { 'LECTURE': 40, 'LAB': 20 };

      service.updateHoursPerDeliveryFormat(courseId, hoursPerDeliveryFormat).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${courseId}/hours-per-delivery-format`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ hoursPerDeliveryFormat });
      req.flush(mockCourse);
    });
  });

  describe('getPeriods', () => {
    it('should send GET request without parameters when no filters provided', (done) => {
      const mockPeriods: PeriodResponse[] = [
        { period: '2025-1S' },
        { period: '2025-2S' }
      ];

      service.getPeriods().subscribe({
        next: (response) => {
          expect(response).toEqual(mockPeriods);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/periods`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPeriods);
    });

    it('should send GET request with campusId parameter', (done) => {
      const campusId = 1;
      const mockPeriods: PeriodResponse[] = [
        { period: '2025-1S' },
        { period: '2025-2S' }
      ];

      service.getPeriods(campusId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockPeriods);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/periods?campusId=${campusId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPeriods);
    });

    it('should send GET request with both campusId and userId parameters', (done) => {
      const campusId = 1;
      const userId = 5;
      const mockPeriods: PeriodResponse[] = [
        { period: '2025-1S' }
      ];

      service.getPeriods(campusId, userId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockPeriods);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/periods?campusId=${campusId}&userId=${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPeriods);
    });
  });

  describe('getCourses', () => {
    const mockCourseBasicResponse: CourseBasicResponse = {
      id: 1,
      shift: 'Matutino',
      description: 'Programación I',
      startDate: '2025-03-01',
      endDate: '2025-07-31',
      curricularUnitName: 'Programación I',
      termName: 'Semestre 1',
      programName: 'Ingeniería en Sistemas',
      teachers: [{
        id: 1,
        fullName: 'Juan Pérez',
        email: 'juan.perez@utec.edu.uy'
      }],
      lastModificationDate: null
    };

    it('should send GET request with pagination parameters', (done) => {
      const mockResponse: PageResponse<CourseBasicResponse> = {
        content: [mockCourseBasicResponse],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        numberOfElements: 1,
        first: true,
        last: true,
        empty: false
      };

      service.getCourses(undefined, undefined, undefined, undefined, 0, 10).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should send GET request with all filter parameters', (done) => {
      const userId = 123;
      const campusId = 1;
      const period = '2025-1';
      const searchText = 'Programación';
      const mockResponse: PageResponse<CourseBasicResponse> = {
        content: [mockCourseBasicResponse],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        numberOfElements: 1,
        first: true,
        last: true,
        empty: false
      };

      service.getCourses(userId, campusId, period, searchText, 0, 10).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=0&size=10&userId=${userId}&campusId=${campusId}&period=${period}&searchText=${encodeURIComponent(searchText)}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should not include optional parameters if they are null or undefined', (done) => {
      const mockResponse: PageResponse<CourseBasicResponse> = {
        content: [mockCourseBasicResponse],
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        numberOfElements: 1,
        first: true,
        last: true,
        empty: false
      };

      service.getCourses(undefined, undefined, '', '', 0, 10).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getLatestCourse', () => {
    it('should send GET request to fetch latest course', (done) => {
      const curricularUnitId = 1;
      const userId = 123;

      service.getLatestCourse(curricularUnitId, userId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockCourse);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${apiUrl}/latest?curricularUnitId=${curricularUnitId}&userId=${userId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCourse);
    });

    it('should return null when no latest course is found', (done) => {
      const curricularUnitId = 1;
      const userId = 123;

      service.getLatestCourse(curricularUnitId, userId).subscribe({
        next: (response) => {
          expect(response).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(
        `${apiUrl}/latest?curricularUnitId=${curricularUnitId}&userId=${userId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(null);
    });
  });
});

