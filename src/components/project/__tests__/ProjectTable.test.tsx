import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectTable } from '../ProjectTable';
import type { Project } from '../../../lib/models/project';

describe('ProjectTable', () => {
  const mockProjects: Project[] = [
    {
      id: 'p1',
      name: 'Project Alpha',
      description: 'First project',
      schemaVersion: 7,
      status: 'active',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-21T00:00:00.000Z',
    },
    {
      id: 'p2',
      name: 'Project Beta',
      description: 'Second project',
      schemaVersion: 7,
      status: 'active',
      createdAt: '2026-06-02T00:00:00.000Z',
      updatedAt: '2026-06-20T00:00:00.000Z',
    },
  ];

  const defaultProps = {
    projects: mockProjects,
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders project rows', () => {
    render(<ProjectTable {...defaultProps} />);
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  it('returns null when projects is empty', () => {
    const { container } = render(<ProjectTable {...defaultProps} projects={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('calls onSelect when a row is clicked', () => {
    render(<ProjectTable {...defaultProps} />);
    fireEvent.click(screen.getByText('Project Alpha'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('p1');
  });

  it('calls onSelect when Enter is pressed on a row', () => {
    render(<ProjectTable {...defaultProps} />);
    const firstRow = screen.getByText('Project Alpha').closest('tr')!;
    fireEvent.keyDown(firstRow, { key: 'Enter' });
    expect(defaultProps.onSelect).toHaveBeenCalledWith('p1');
  });

  it('calls onSelect when Space is pressed on a row', () => {
    render(<ProjectTable {...defaultProps} />);
    const firstRow = screen.getByText('Project Alpha').closest('tr')!;
    fireEvent.keyDown(firstRow, { key: ' ' });
    expect(defaultProps.onSelect).toHaveBeenCalledWith('p1');
  });

  it('does not call onSelect for other key presses', () => {
    render(<ProjectTable {...defaultProps} />);
    const firstRow = screen.getByText('Project Alpha').closest('tr')!;
    fireEvent.keyDown(firstRow, { key: 'Tab' });
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<ProjectTable {...defaultProps} />);
    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('calls onRemove when delete button is clicked', () => {
    render(<ProjectTable {...defaultProps} />);
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onRemove).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('row has tabIndex, role, and aria-label', () => {
    render(<ProjectTable {...defaultProps} />);
    const firstRow = screen.getByText('Project Alpha').closest('tr')!;
    expect(firstRow).toHaveAttribute('tabindex', '0');
    expect(firstRow).toHaveAttribute('role', 'button');
    expect(firstRow).toHaveAttribute('aria-label', 'Project Alpha を開く');
  });

  it('displays description or fallback dash', () => {
    const projectsWithNoDesc = [{ ...mockProjects[0], description: undefined }];
    render(<ProjectTable {...defaultProps} projects={projectsWithNoDesc} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
