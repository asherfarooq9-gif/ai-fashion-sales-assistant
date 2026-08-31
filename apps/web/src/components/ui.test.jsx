import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Badge, money } from './ui.jsx';

describe('ui helpers', () => {
  it('formats money in PKR', () => {
    expect(money(4999)).toBe('Rs 4,999');
    expect(money()).toBe('Rs 0');
  });

  it('renders a badge', () => {
    render(<Badge tone="green">live</Badge>);
    expect(screen.getByText('live')).toBeInTheDocument();
  });

  it('DataTable renders rows and handles clicks', () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={[{ key: 'name', header: 'Name' }]}
        rows={[{ _id: '1', name: 'Maxi' }]}
        onRowClick={onRowClick}
      />
    );
    fireEvent.click(screen.getByText('Maxi'));
    expect(onRowClick).toHaveBeenCalledWith({ _id: '1', name: 'Maxi' });
  });

  it('DataTable shows the empty state', () => {
    render(<DataTable columns={[]} rows={[]} empty="Nothing" />);
    expect(screen.getByText('Nothing')).toBeInTheDocument();
  });
});
