import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Leaf } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState Component', () => {
  it('renders correctly with required props', () => {
    render(
      <EmptyState 
        icon={Leaf}
        title="No Data"
        description="There is nothing to see here."
      />
    );
    
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is nothing to see here.')).toBeInTheDocument();
    // The button shouldn't exist if onAction isn't passed
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the action button and calls onAction when clicked', () => {
    const mockAction = jest.fn();
    
    render(
      <EmptyState 
        icon={Leaf}
        title="No Data"
        description="There is nothing to see here."
        actionLabel="Click Me"
        onAction={mockAction}
      />
    );
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
