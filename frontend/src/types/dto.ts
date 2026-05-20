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

export interface TaskDto {
  id: string;
  projectId: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTaskDto {
  description: string;
}

export interface ProjectListItemDto {
  id: string;
  title: string;
  clientName: string;
  price: number;
  startDate: string;
  endDate: string;
  hostingProvider: string;
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
  clientId: string;
  clientName: string;
  price: number;
  priceFormatted: string;
  startDate: string;
  endDate: string;
  warrantyEndDate: string;
  hostingRenewalDate: string;
  daysLeftForWarranty: number;
  daysUntilHostingRenewal: number;
  driveLink: string | null;
  gitHubRepoUrl: string | null;
  hostingProvider: string;
  externalDatabase: string | null;
  isActive: boolean;
  tasks: TaskDto[];
}

export interface CreateProjectDto {
  clientId: string | null;
  newClient: CreateClientDto | null;
  title: string;
  price: number;
  startDate: string;
  endDate: string;
  driveLink: string | null;
  gitHubRepoUrl: string | null;
  hostingProvider: string;
  externalDatabase: string | null;
}

export interface ReadmeResponse {
  markdown: string | null;
  message: string | null;
}

export interface UpdateProjectDto {
  title: string;
  price: number;
  startDate: string;
  endDate: string;
  driveLink: string | null;
  gitHubRepoUrl: string | null;
  hostingProvider: string;
  externalDatabase: string | null;
  isActive: boolean;
}
