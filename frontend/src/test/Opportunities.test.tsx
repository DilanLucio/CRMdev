import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Opportunities } from '../pages/Opportunities';
import { OpportunityDetailDrawer } from '../components/opportunities/OpportunityDetailDrawer';
import { server } from './mocks/server';
import { mockOpportunity } from './mocks/handlers';

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Opportunities', () => {
  it('renderiza skeleton mientras carga', () => {
    server.use(
      http.get('http://localhost/api/opportunities', async () => {
        await new Promise(() => {}); // never resolves
      }),
    );
    render(wrap(<Opportunities />));
    // Skeletons use animate-pulse div, table not present yet
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renderiza lead mockeado tras fetch', async () => {
    render(wrap(<Opportunities />));
    await waitFor(() => expect(screen.getByText('Acme Corp')).toBeInTheDocument());
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('filtra por estado AiGenerated', async () => {
    render(wrap(<Opportunities />));
    await waitFor(() => screen.getByText('Acme Corp'));
    const chip = screen.getByRole('button', { name: 'IA generado' });
    await userEvent.click(chip);
    await waitFor(() => expect(screen.getByText('Acme Corp')).toBeInTheDocument());
  });

  it('muestra empty state cuando lista vacía', async () => {
    server.use(
      http.get('http://localhost/api/opportunities', () => HttpResponse.json([])),
    );
    render(wrap(<Opportunities />));
    await waitFor(() =>
      expect(screen.getByText('Sin oportunidades para este filtro.')).toBeInTheDocument(),
    );
  });
});

describe('OpportunityDetailDrawer', () => {
  it('muestra markdown de DevelopmentPossibility', async () => {
    render(
      wrap(
        <OpportunityDetailDrawer
          opportunity={mockOpportunity}
          onClose={() => {}}
          onUpdated={() => {}}
        />,
      ),
    );
    await waitFor(() => expect(screen.getByText('ERP')).toBeInTheDocument());
  });

  it('bloquea Descartar sin razón', async () => {
    render(
      wrap(
        <OpportunityDetailDrawer
          opportunity={mockOpportunity}
          onClose={() => {}}
          onUpdated={() => {}}
        />,
      ),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    const confirmBtn = screen.getByRole('button', { name: 'Confirmar descarte' });
    expect(confirmBtn).toBeDisabled();
  });

  it('PUT status invoca mutation y refresca lista', async () => {
    const onUpdated = vi.fn();
    render(
      wrap(
        <OpportunityDetailDrawer
          opportunity={mockOpportunity}
          onClose={() => {}}
          onUpdated={onUpdated}
        />,
      ),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Marcar Evaluando' }));
    await waitFor(() => expect(onUpdated).toHaveBeenCalled());
  });
});
