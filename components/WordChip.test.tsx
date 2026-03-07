import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableRole } from './WordChip';
import type { RoleDefinition } from '../types';

// ─── Fixture ──────────────────────────────────────────────────────────────────

const ROLE: RoleDefinition = {
  key: 'pv',
  label: 'Persoonsvorm',
  shortLabel: 'PV',
  colorClass: 'text-purple-700 bg-purple-100',
  borderColorClass: 'border-purple-400',
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('DraggableRole', () => {
  it('renders the role label', () => {
    render(<DraggableRole role={ROLE} onDragStart={vi.fn()} />);
    expect(screen.getByText('Persoonsvorm')).toBeInTheDocument();
  });

  it('renders the shortLabel', () => {
    render(<DraggableRole role={ROLE} onDragStart={vi.fn()} />);
    expect(screen.getByText('PV')).toBeInTheDocument();
  });

  it('has the draggable attribute set', () => {
    const { container } = render(<DraggableRole role={ROLE} onDragStart={vi.fn()} />);
    const draggable = container.firstChild as HTMLElement;
    expect(draggable).toHaveAttribute('draggable', 'true');
  });

  it('calls onDragStart with the role key when drag begins', () => {
    const onDragStart = vi.fn();
    const { container } = render(<DraggableRole role={ROLE} onDragStart={onDragStart} />);
    const draggable = container.firstChild as HTMLElement;
    fireEvent.dragStart(draggable);
    expect(onDragStart).toHaveBeenCalledWith(expect.any(Object), 'pv');
  });

  it('applies role colorClass and borderColorClass', () => {
    const { container } = render(<DraggableRole role={ROLE} onDragStart={vi.fn()} />);
    const draggable = container.firstChild as HTMLElement;
    expect(draggable.className).toContain('text-purple-700');
    expect(draggable.className).toContain('border-purple-400');
  });
});
