import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the payroll report page with a download action', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /laporan gaji/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /download laporan gaji/i })).toBeEnabled();
});
