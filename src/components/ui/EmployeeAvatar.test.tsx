import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmployeeAvatar } from './EmployeeAvatar';

describe('EmployeeAvatar', () => {
  it('shows the employee initial when the photo URL is missing', () => {
    render(<EmployeeAvatar fullName="Example Employee" photoUrl={null} />);

    expect(screen.getByRole('img', { name: 'Example Employee avatar' }))
      .toHaveTextContent('E');
  });

  it('shows the employee initial when the image fails to load', () => {
    const { container } = render(
      <EmployeeAvatar
        fullName="Example Employee"
        photoUrl="https://example.com/invalid-avatar.png"
      />,
    );

    const image = container.querySelector('img');
    expect(image).not.toBeNull();

    fireEvent.error(image!);

    expect(screen.getByRole('img', { name: 'Example Employee avatar' }))
      .toHaveTextContent('E');
    expect(container.querySelector('img')).toBeNull();
  });

  it('uses the updated photo URL when the employee photo changes', () => {
    const { container, rerender } = render(
      <EmployeeAvatar
        fullName="Example Employee"
        photoUrl="https://example.com/invalid-avatar.png"
      />,
    );

    fireEvent.error(container.querySelector('img')!);

    rerender(
      <EmployeeAvatar
        fullName="Example Employee"
        photoUrl="https://example.com/new-avatar.png"
      />,
    );

    expect(container.querySelector('img'))
      .toHaveAttribute('src', 'https://example.com/new-avatar.png');
  });
});