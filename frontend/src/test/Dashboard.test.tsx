import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Dashboard', () => {
  it('renders project title from API', async () => {
    render(<Dashboard />, { wrapper });
    await waitFor(() => expect(screen.getByText('Acme Site')).toBeInTheDocument());
  });

  it('renders client name', async () => {
    render(<Dashboard />, { wrapper });
    await waitFor(() => expect(screen.getByText('Acme Corp')).toBeInTheDocument());
  });

  it('renders new project button', () => {
    render(<Dashboard />, { wrapper });
    expect(screen.getByText('Nuevo proyecto')).toBeInTheDocument();
  });
});
