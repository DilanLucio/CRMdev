import { http, HttpResponse } from 'msw';
import type { ProjectListItemDto, ProjectDetailsDto } from '../../types/dto';
import { ProjectType, PricingModel } from '../../types/dto';

const mockProject: ProjectListItemDto = {
  id: 'proj-1',
  title: 'Acme Site',
  type: ProjectType.LandingPage,
  clientName: 'Acme Corp',
  price: 25000,
  pricingModel: PricingModel.OneTime,
  nextPaymentDate: null,
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
  type: ProjectType.LandingPage,
  services: [],
  clientId: 'client-1',
  clientName: 'Acme Corp',
  price: 25000,
  priceFormatted: '$25,000',
  pricingModel: PricingModel.OneTime,
  nextPaymentDate: null,
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
  notes: null,
  isActive: true,
  tasks: [
    { id: 'task-1', projectId: 'proj-1', description: 'Fix PDF bug', isCompleted: false, createdAt: '2026-05-01T00:00:00Z' },
    { id: 'task-2', projectId: 'proj-1', description: 'Launch site', isCompleted: true, createdAt: '2026-04-01T00:00:00Z' },
  ],
};

import type { OpportunityDto } from '../../types/dto';
import { OpportunityStatus } from '../../types/dto';

export const mockOpportunity: OpportunityDto = {
  id: 'opp-1',
  companyName: 'Acme Corp',
  contactName: 'Jane Doe',
  contactEmail: 'jane@acme.com',
  developmentPossibility: '## ERP\nNeeds integration.',
  externalLeadId: 'lead-1',
  status: OpportunityStatus.AiGenerated,
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
  discardReason: null,
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

  http.get('http://localhost/api/opportunities', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    if (status === String(OpportunityStatus.AiGenerated)) {
      return HttpResponse.json([mockOpportunity]);
    }
    return HttpResponse.json([mockOpportunity]);
  }),

  http.put('http://localhost/api/opportunities/:id/status', async ({ request }) => {
    const body = await request.json() as { status: number; discardReason: string | null };
    return HttpResponse.json({ ...mockOpportunity, status: body.status, updatedAt: new Date().toISOString() });
  }),
];
