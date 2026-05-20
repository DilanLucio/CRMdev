import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskAccordion } from '../components/projects/TaskAccordion';
import type { TaskDto } from '../types/dto';

const tasks: TaskDto[] = [
  { id: 'task-1', projectId: 'proj-1', description: 'Fix PDF bug', isCompleted: false, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'task-2', projectId: 'proj-1', description: 'Launch site', isCompleted: true, createdAt: '2026-04-01T00:00:00Z' },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('TaskAccordion', () => {
  it('renders pending task description', () => {
    render(<TaskAccordion projectId="proj-1" tasks={tasks} />, { wrapper });
    expect(screen.getByText('Fix PDF bug')).toBeInTheDocument();
  });

  it('renders completed task with strikethrough class after expanding group', async () => {
    const user = userEvent.setup();
    render(<TaskAccordion projectId="proj-1" tasks={tasks} />, { wrapper });
    const completedHeader = screen.getByText('Completed Milestones');
    await user.click(completedHeader);
    const completedText = screen.getByText('Launch site');
    expect(completedText.className).toContain('line-through');
  });

  it('renders add task input', () => {
    render(<TaskAccordion projectId="proj-1" tasks={tasks} />, { wrapper });
    expect(screen.getByPlaceholderText('Nueva tarea pendiente...')).toBeInTheDocument();
  });

  it('enables submit button when input has value', async () => {
    const user = userEvent.setup();
    render(<TaskAccordion projectId="proj-1" tasks={tasks} />, { wrapper });
    const input = screen.getByPlaceholderText('Nueva tarea pendiente...');
    const button = screen.getByRole('button', { name: 'Agregar' });
    expect(button).toBeDisabled();
    await user.type(input, 'New task');
    expect(button).not.toBeDisabled();
  });
});
