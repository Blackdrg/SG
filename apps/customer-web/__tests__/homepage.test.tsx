import { render, screen } from '@testing-library/react';
import HomePage from '@/pages/index';

describe('HomePage', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders welcome message', () => {
    // Mock the router
    jest.mock('next/router', () => ({
      useRouter: () => ({
        push: jest.fn()
      })
    }));

    // Mock the API call
    jest.mock('@spicegarden/shared/api', () => ({
      restaurantsApi: {
        list: jest.fn().mockResolvedValue([])
      }
    }));

    render(<HomePage />);
    
    expect(screen.getByText(/guest/i)).toBeInTheDocument();
  });

  it('renders search bar', () => {
    jest.mock('next/router', () => ({
      useRouter: () => ({
        push: jest.fn()
      })
    }));

    jest.mock('@spicegarden/shared/api', () => ({
      restaurantsApi: {
        list: jest.fn().mockResolvedValue([])
      }
    }));

    render(<HomePage />);
    
    expect(screen.getByText(/search restaurants, dishes/i)).toBeInTheDocument();
  });

  it('renders offers banner', () => {
    jest.mock('next/router', () => ({
      useRouter: () => ({
        push: jest.fn()
      })
    }));

    jest.mock('@spicegarden/shared/api', () => ({
      restaurantsApi: {
        list: jest.fn().mockResolvedValue([])
      }
    }));

    render(<HomePage />);
    
    expect(screen.getByText(/50% OFF/i)).toBeInTheDocument();
  });
});