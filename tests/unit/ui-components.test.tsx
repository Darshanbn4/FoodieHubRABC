import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

describe('UI Components', () => {
  describe('Button', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeDefined();
    });

    it('applies variant classes', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-blue-600');
    });

    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Input', () => {
    it('renders with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeDefined();
    });

    it('renders error message', () => {
      render(<Input label="Email" error="Invalid email" />);
      expect(screen.getByText('Invalid email')).toBeDefined();
    });

    it('renders helper text', () => {
      render(<Input label="Email" helperText="Enter your email" />);
      expect(screen.getByText('Enter your email')).toBeDefined();
    });
  });

  describe('Card', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeDefined();
    });

    it('renders with header and title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeDefined();
      expect(screen.getByText('Content')).toBeDefined();
    });
  });
});
