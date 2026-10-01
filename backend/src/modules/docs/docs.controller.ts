import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller(['api/docs', 'docs'])
export class DocsController {
  @Get('openapi.json')
  getOpenApiJson(@Res() res: Response) {
    return res.json(this.getOpenApiSpec());
  }

  @Get()
  getDocsUi(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Corporate Employee & Intern Work Management Portal - API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { display: none !important; }
    .swagger-ui .info .title { font-family: inherit; font-size: 28px; color: #1e293b; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/docs/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  private getOpenApiSpec() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Corporate Employee & Intern Work Management Portal API',
        description: 'Enterprise REST API specification covering Authentication, RBAC, Employees, Teams, Projects, Task Planning, Deliverable Submissions, CMS, LMS, Audit Logs, and Reports.',
        version: '4.0.0',
      },
      servers: [
        { url: 'http://localhost:4000', description: 'Local Development Server' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
      paths: {
        '/api/auth/login': {
          post: {
            tags: ['Authentication'],
            summary: 'Authenticate employee, team leader, or administrator',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['identifier', 'password'],
                    properties: {
                      identifier: { type: 'string', example: 'admin@corporate.com' },
                      password: { type: 'string', example: 'Admin@123456' },
                      rememberMe: { type: 'boolean', example: false },
                    },
                  },
                },
              },
            },
            responses: {
              200: { description: 'JWT authentication successful' },
              401: { description: 'Invalid credentials or inactive account' },
            },
          },
        },
        '/api/auth/me': {
          get: {
            tags: ['Authentication'],
            summary: 'Retrieve authenticated user session profile',
            responses: { 200: { description: 'User session data' } },
          },
        },
        '/api/auth/impersonate': {
          post: {
            tags: ['Authentication'],
            summary: 'Admin View Mode / Impersonate Team Leader or Employee',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      targetUserId: { type: 'string' },
                      targetEmployeeId: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { 200: { description: 'Scoped impersonation session generated' } },
          },
        },
        '/api/reports/organization': {
          get: {
            tags: ['Enterprise Reports'],
            summary: 'Retrieve high-level organization breakdown report',
            responses: { 200: { description: 'Organization metrics' } },
          },
        },
        '/api/reports/work': {
          get: {
            tags: ['Enterprise Reports'],
            summary: 'Retrieve overall corporate work deliverables report',
            responses: { 200: { description: 'Work deliverables metrics' } },
          },
        },
        '/api/reports/projects': {
          get: {
            tags: ['Enterprise Reports'],
            summary: 'Retrieve project-by-project progress and health report',
            responses: { 200: { description: 'Projects status report' } },
          },
        },
        '/api/reports/employees': {
          get: {
            tags: ['Enterprise Reports'],
            summary: 'Retrieve individual employee workload and performance report',
            responses: { 200: { description: 'Employees performance report' } },
          },
        },
        '/api/reports/export': {
          get: {
            tags: ['Enterprise Reports'],
            summary: 'Export report data in CSV format',
            parameters: [
              { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['organization', 'work', 'projects', 'employees'] } },
              { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['csv', 'xlsx'] } },
            ],
            responses: { 200: { description: 'CSV file download' } },
          },
        },
        '/api/audit-logs': {
          get: {
            tags: ['Audit Logs'],
            summary: 'Paginated search & filtering of immutable system audit trails',
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 15 } },
              { name: 'search', in: 'query', schema: { type: 'string' } },
              { name: 'type', in: 'query', schema: { type: 'string' } },
            ],
            responses: { 200: { description: 'Audit log entries' } },
          },
        },
        '/api/search': {
          get: {
            tags: ['Global Search'],
            summary: 'Cross-entity global search across employees, teams, projects, tasks, courses, and resources',
            parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Categorized search results' } },
          },
        },
        '/api/settings': {
          get: {
            tags: ['Admin Settings'],
            summary: 'Get organization configuration and policy settings',
            responses: { 200: { description: 'Current settings' } },
          },
          patch: {
            tags: ['Admin Settings'],
            summary: 'Update organization policies, file limits, or default priorities',
            responses: { 200: { description: 'Updated settings' } },
          },
        },
      },
    };
  }
}
