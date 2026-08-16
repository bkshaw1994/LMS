const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🎓 MERNStackJS - LMS REST API Documentation',
      version: '1.0.0',
      description:
        'Interactive OpenAPI 3.0 API documentation for the 12-Week Intensive MERN Stack Web Development Training Program Learning Management System.',
      contact: {
        name: 'MERNStackJS Engineering Team',
        url: 'https://mernstackjs-be.vercel.app',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local Development Server',
      },
      {
        url: 'https://mernstackjs-be.vercel.app',
        description: 'Production Vercel Cloud Backend',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65cb1234567890abcdef1234' },
            name: { type: 'string', example: 'Alex Morgan' },
            email: { type: 'string', example: 'alex@example.com' },
            role: { type: 'string', enum: ['student', 'trainer', 'admin'], example: 'student' },
            mobile: { type: 'string', example: '+1 (555) 019-2834' },
            avatar: { type: 'string', example: 'data:image/png;base64,...' },
            resumeUrl: { type: 'string', example: 'data:application/pdf;base64,...' },
          },
        },
        CourseModule: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            weekNumber: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Vanilla JS Fundamentals' },
            category: { type: 'string', example: 'Vanilla JS' },
            description: { type: 'string' },
            lessons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  duration: { type: 'string' },
                  youtubeUrl: { type: 'string' },
                },
              },
            },
            assignment: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                requirements: { type: 'array', items: { type: 'string' } },
                starterRepoUrl: { type: 'string' },
                starterFileName: { type: 'string' },
                starterCode: { type: 'string' },
                points: { type: 'integer', example: 100 },
              },
            },
          },
        },
        Submission: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            module: { type: 'string' },
            githubUrl: { type: 'string', example: 'https://github.com/username/project-repo' },
            notes: { type: 'string' },
            status: { type: 'string', example: 'submitted' },
            submittedAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
          },
        },
      },
    },
    paths: {
      '/': {
        get: {
          summary: 'Root Server Status',
          tags: ['Health & Status'],
          responses: {
            200: {
              description: 'Server is running smoothly',
            },
          },
        },
      },
      '/api/health': {
        get: {
          summary: 'Health Check Endpoint',
          tags: ['Health & Status'],
          responses: {
            200: {
              description: 'LMS Backend Server status OK',
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new student account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Alex Morgan' },
                    email: { type: 'string', example: 'alex@example.com' },
                    password: { type: 'string', example: 'Password123!' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Registration successful, returns JWT token & user profile' },
            400: { description: 'User already exists or missing required fields' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Authenticate student or trainer & return JWT token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'alex@example.com' },
                    password: { type: 'string', example: 'Password123!' },
                    role: { type: 'string', enum: ['student', 'trainer'], example: 'student' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns JWT token' },
            401: { description: 'Invalid email or password' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Get current logged-in user profile',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile data retrieved successfully' },
            401: { description: 'Unauthorized / Missing token' },
          },
        },
      },
      '/api/auth/profile': {
        put: {
          summary: 'Update student profile details (name, mobile, avatar, resumeUrl)',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Alex Morgan' },
                    mobile: { type: 'string', example: '+1 (555) 019-2834' },
                    avatar: { type: 'string', example: 'data:image/png;base64,...' },
                    resumeUrl: { type: 'string', example: 'data:application/pdf;base64,...' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Profile updated successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/change-password': {
        put: {
          summary: 'Change student account password',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string', example: 'OldPassword123!' },
                    newPassword: { type: 'string', example: 'NewSecurePassword123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Password changed successfully' },
            400: { description: 'Incorrect current password or invalid input' },
          },
        },
      },
      '/api/modules': {
        get: {
          summary: 'Fetch all 12-week curriculum modules',
          tags: ['Curriculum Modules'],
          responses: {
            200: { description: 'List of all 12 modules with lessons, assignments, & quizzes' },
          },
        },
      },
      '/api/modules/{id}': {
        get: {
          summary: 'Fetch single module details by ObjectId or Week Number (1-12)',
          tags: ['Curriculum Modules'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Module ObjectId or Week Number (e.g. 1)',
            },
          ],
          responses: {
            200: { description: 'Module details retrieved' },
            404: { description: 'Module not found' },
          },
        },
      },
      '/api/progress': {
        get: {
          summary: 'Get logged-in student overall progress, lesson completion, and submissions',
          tags: ['Student Progress'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Student progress summary & week-by-week completion' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/progress/update': {
        post: {
          summary: 'Toggle / Mark lesson checkmark as complete or incomplete',
          tags: ['Student Progress'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['moduleId', 'lessonId'],
                  properties: {
                    moduleId: { type: 'string', example: '65cb1234567890abcdef1234' },
                    lessonId: { type: 'string', example: 'les_1' },
                    isCompleted: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Lesson status updated' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/submissions/submit': {
        post: {
          summary: 'Submit GitHub repository URL for weekly project assignment',
          tags: ['Assignments'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['moduleId', 'githubUrl'],
                  properties: {
                    moduleId: { type: 'string', example: '65cb1234567890abcdef1234' },
                    githubUrl: { type: 'string', example: 'https://github.com/username/project-repo' },
                    notes: { type: 'string', example: 'Completed extra bonus requirements.' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Assignment submitted successfully' },
            400: { description: 'Invalid GitHub URL format' },
          },
        },
      },
      '/api/submissions/{moduleId}': {
        get: {
          summary: 'Get assignment submission details for a specific module',
          tags: ['Assignments'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'moduleId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Module ObjectId or Week Number',
            },
          ],
          responses: {
            200: { description: 'Submission details retrieved' },
          },
        },
      },
      '/api/quizzes/{moduleId}': {
        get: {
          summary: 'Get weekly quiz questions for a module (sanitized)',
          tags: ['Quizzes'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'moduleId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Module ObjectId or Week Number',
            },
          ],
          responses: {
            200: { description: 'Quiz questions & student attempt' },
          },
        },
      },
      '/api/quizzes/submit': {
        post: {
          summary: 'Submit quiz answers for automated evaluation & feedback',
          tags: ['Quizzes'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['moduleId', 'answers'],
                  properties: {
                    moduleId: { type: 'string', example: '65cb1234567890abcdef1234' },
                    answers: {
                      type: 'object',
                      example: { q1: 1, q2: 0, q3: 2, q4: 3 },
                      description: 'Map of questionId to selected option index',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Quiz score, pass/fail status, & answer review explanations' },
          },
        },
      },
      '/api/trainer/students': {
        get: {
          summary: 'Get cohort metrics & detailed student progress list',
          tags: ['Trainer Dashboard'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Cohort summary metrics & student performance breakdown' },
            403: { description: 'Forbidden - Trainer authorization required' },
          },
        },
      },
      '/api/trainer/student/{identifier}': {
        get: {
          summary: 'Get detailed metrics & week-by-week progress for single student by ID or Name Slug',
          tags: ['Trainer Dashboard'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'identifier',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Student ObjectId or URL Name Slug (e.g. alex-morgan)',
            },
          ],
          responses: {
            200: { description: 'Detailed student progress profile' },
            404: { description: 'Student not found' },
          },
        },
      },
      '/api/trainer/assignments': {
        get: {
          summary: 'Get all 12 module project assignments for editing',
          tags: ['Trainer Dashboard'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'All modules with assignment briefs' },
          },
        },
      },
      '/api/trainer/assignment/{weekNumber}': {
        put: {
          summary: 'Update project assignment brief, starter code, & template repo for a week',
          tags: ['Trainer Dashboard'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'weekNumber',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'Week Number (1 to 12)',
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Interactive E-Commerce Cart' },
                    description: { type: 'string' },
                    requirements: { type: 'array', items: { type: 'string' } },
                    starterRepoUrl: { type: 'string' },
                    starterFileName: { type: 'string' },
                    starterCode: { type: 'string' },
                    points: { type: 'integer', example: 100 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Assignment updated successfully' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const customSwaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; padding-bottom: 40px; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-size: 32px; font-weight: 700; color: #1e293b; }
    .swagger-ui .opblock.opblock-post { background: rgba(59, 130, 246, 0.05); border-color: #3b82f6; }
    .swagger-ui .opblock.opblock-get { background: rgba(16, 185, 129, 0.05); border-color: #10b981; }
    .swagger-ui .opblock.opblock-put { background: rgba(245, 158, 11, 0.05); border-color: #f59e0b; }
    .swagger-ui .btn.execute { background-color: #4f46e5; border-color: #4f46e5; color: #fff; }
  `,
  customSiteTitle: 'MERNStackJS API Docs & Interactive Dashboard',
  customfavIcon: 'https://cdn-icons-png.flaticon.com/512/2721/2721620.png',
};

module.exports = {
  swaggerUi,
  swaggerSpec,
  customSwaggerOptions,
};
