export interface ClientDto {
  id: string;
  name: string;
  contactNumber: string;
  email: string | null;
  createdAt: string;
}

export interface CreateClientDto {
  name: string;
  contactNumber: string;
  email: string | null;
}

export interface UpdateClientDto {
  name: string;
  contactNumber: string;
  email: string | null;
}

export interface TaskDto {
  id: string;
  projectId: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskListItemDto {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTaskDto {
  description: string;
}

export const ProjectType = {
  LandingPage: 0,
  ErpCrm: 1,
  Servicios: 2,
} as const;
export type ProjectTypeValue = typeof ProjectType[keyof typeof ProjectType];

export const PricingModel = {
  OneTime: 0,
  Monthly: 1,
  Subscription: 2,
} as const;
export type PricingModelValue = typeof PricingModel[keyof typeof PricingModel];

export interface ProjectListItemDto {
  id: string;
  title: string;
  type: ProjectTypeValue;
  clientName: string;
  price: number;
  pricingModel: PricingModelValue;
  nextPaymentDate: string | null;
  startDate: string;
  endDate: string;
  hostingProvider: string | null;
  isActive: boolean;
  warrantyEndDate: string;
  hostingRenewalDate: string;
  daysLeftForWarranty: number;
  daysUntilHostingRenewal: number;
  hasPendingTasks: boolean;
}

export interface ProjectDetailsDto {
  id: string;
  title: string;
  type: ProjectTypeValue;
  services: string[];
  clientId: string;
  clientName: string;
  price: number;
  priceFormatted: string;
  pricingModel: PricingModelValue;
  nextPaymentDate: string | null;
  startDate: string;
  endDate: string;
  warrantyEndDate: string;
  hostingRenewalDate: string;
  daysLeftForWarranty: number;
  daysUntilHostingRenewal: number;
  driveLink: string | null;
  gitHubRepoUrl: string | null;
  hostingProvider: string | null;
  externalDatabase: string | null;
  notes: string | null;
  isActive: boolean;
  tasks: TaskDto[];
}

export interface CreateProjectDto {
  clientId: string | null;
  newClient: CreateClientDto | null;
  title: string;
  type: ProjectTypeValue;
  services: string[] | null;
  price: number;
  pricingModel: PricingModelValue;
  nextPaymentDate: string | null;
  startDate: string;
  endDate: string;
  driveLink: string | null;
  gitHubRepoUrl: string | null;
  hostingProvider: string | null;
  externalDatabase: string | null;
  notes: string | null;
}

export interface ReadmeResponse {
  markdown: string | null;
  message: string | null;
}

export const OpportunityStatus = {
  AiGenerated: 0,
  Evaluating: 1,
  Contacted: 2,
  Discarded: 3,
} as const;
export type OpportunityStatusValue = typeof OpportunityStatus[keyof typeof OpportunityStatus];

export interface OpportunityDto {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  developmentPossibility: string;
  externalLeadId: string | null;
  status: OpportunityStatusValue;
  createdAt: string;
  updatedAt: string;
  discardReason: string | null;
}

export interface CreateOpportunityDto {
  companyName: string;
  contactName: string;
  contactEmail: string;
  developmentPossibility: string;
  externalLeadId: string | null;
}

export interface UpdateOpportunityStatusDto {
  status: OpportunityStatusValue;
  discardReason: string | null;
}

export interface UpdateProjectDto {
  title: string;
  type: ProjectTypeValue;
  services: string[] | null;
  price: number;
  pricingModel: PricingModelValue;
  nextPaymentDate: string | null;
  startDate: string;
  endDate: string;
  driveLink: string | null;
  gitHubRepoUrl: string | null;
  hostingProvider: string | null;
  externalDatabase: string | null;
  notes: string | null;
  isActive: boolean;
}
