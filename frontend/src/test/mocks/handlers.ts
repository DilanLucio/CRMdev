import { http, HttpResponse } from 'msw';
import type { ProjectListItemDto, ProjectDetailsDto } from '../../types/dto';

const mockProject: ProjectListItemDto = {
  id: 'proj-1',
  title: 'Acme Site',
  clientName: 'Acme Corp',
  price: 25000,
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-04-01T00:00:00Z',
  hostingProvider: 'Vercel',
  isActive: true,
  warrantyEndDate: '2026-07-01T00:00:00Z',
  hostingRenewalDate: '2027-04-01T00:00:00Z',
  daysLeftForWarranty: 42,
  daysUntilHostingRenewal: 315,
  hasPendingTasks: true,
};

const mockProjectDetails: ProjectDetailsDto = {
  id: 'proj-1',
  title: 'Acme Site',
  clientId: 'client-1',
  clientName: 'Acme Corp',
  price: 25000,
  priceFormatted: '$25,000',
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-04-01T00:00:00Z',
  warrantyEndDate: '2026-07-01T00:00:00Z',
  hostingRenewalDate: '2027-04-01T00:00:00Z',
  daysLeftForWarranty: 42,
  daysUntilHostingRenewal: 315,
  driveLink: null,
  gitHubRepoUrl: null,
  hostingProvider: 'Vercel',
  externalDatabase: null,
  isActive: true,
  tasks: [
    { id: 'task-1', projectId: 'proj-1', description: 'Fix PDF bug', isCompleted: false, createdAt: '2026-05-01T00:00:00Z' },
    { id: 'task-2', projectId: 'proj-1', description: 'Launch site', isCompleted: true, createdAt: '2026-04-01T00:00:00Z' },
  ],
};

export const handlers = [
  http.get('http://localhost/api/projects', () => HttpResponse.json([mockProject])),
  http.get('http://localhost/api/projects/proj-1', () => HttpResponse.json(mockProjectDetails)),
  http.get('http://localhost/api/projects/proj-1/readme', () =>
    HttpResponse.json({ markdown: null, message: 'No GitHub repo configured for this project.' })
  ),
  http.post('http://localhost/api/projects/proj-1/tasks', async ({ request }) => {
    const body = await request.json() as { description: string };
    return HttpResponse.json({
      id: 'task-new',
      projectId: 'proj-1',
      description: body.description,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
  }),
  http.patch('http://localhost/api/tasks/task-1/complete', () =>
    HttpResponse.json({ id: 'task-1', projectId: 'proj-1', description: 'Fix PDF bug', isCompleted: true, createdAt: '2026-05-01T00:00:00Z' })
  ),
];
