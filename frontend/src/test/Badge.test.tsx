import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../components/ui/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies warning styles', () => {
    render(<Badge variant="warning">Alert</Badge>);
    const el = screen.getByText('Alert');
    expect(el.className).toContain('text-amber-600');
  });

  it('applies success styles', () => {
    render(<Badge variant="success">OK</Badge>);
    const el = screen.getByText('OK');
    expect(el.className).toContain('text-emerald-600');
  });

  it('defaults to muted variant', () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText('Default');
    expect(el.className).toContain('text-slate-500');
  });
});
