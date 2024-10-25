import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CountryNews from './CountryNews';
import { MemoryRouter, Route } from 'react-router-dom';

// Mock fetch API
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            totalResults: 10,
            articles: [
              {
                title: 'Test Title 1',
                description: 'Test Description 1',
                urlToImage: 'test-image-1.jpg',
                publishedAt: '2024-10-23',
                url: 'https://example.com/1',
                author: 'Author 1',
                source: { name: 'Source 1' },
              },
              {
                title: 'Test Title 2',
                description: 'Test Description 2',
                urlToImage: 'test-image-2.jpg',
                publishedAt: '2024-10-22',
                url: 'https://example.com/2',
                author: 'Author 2',
                source: { name: 'Source 2' },
              },
            ],
          },
        }),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

function renderCountryNewsWithRouter(params) {
  render(
    <MemoryRouter initialEntries={[`/country/${params.iso}`]}>
      <Route path="/country/:iso">
        <CountryNews />
      </Route>
    </MemoryRouter>
  );
}

describe('CountryNews Component', () => {
  it('should display a loading indicator while fetching news', () => {
    renderCountryNewsWithRouter({ iso: 'us' });
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render news articles after fetching data', async () => {
    renderCountryNewsWithRouter({ iso: 'us' });

    await waitFor(() => {
      expect(screen.getByText('Test Title 1')).toBeInTheDocument();
      expect(screen.getByText('Test Description 1')).toBeInTheDocument();
      expect(screen.getByText('Test Title 2')).toBeInTheDocument();
      expect(screen.getByText('Test Description 2')).toBeInTheDocument();
    });
  });

  it('should display an error message if the API fetch fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Failed to fetch news'))
    );

    renderCountryNewsWithRouter({ iso: 'us' });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch news. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should handle pagination and fetch next set of articles when Next is clicked', async () => {
    renderCountryNewsWithRouter({ iso: 'us' });

    // Wait for initial articles to load
    await waitFor(() => {
      expect(screen.getByText('Test Title 1')).toBeInTheDocument();
    });

    // Click on Next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Verify the fetch is called with the next page
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('should disable the Prev button when on the first page', async () => {
    renderCountryNewsWithRouter({ iso: 'us' });

    await waitFor(() => {
      expect(screen.getByText('Test Title 1')).toBeInTheDocument();
    });

    const prevButton = screen.getByText('Prev');
    expect(prevButton).toBeDisabled();
  });

  it('should disable the Next button when on the last page', async () => {
    renderCountryNewsWithRouter({ iso: 'us' });

    await waitFor(() => {
      expect(screen.getByText('Test Title 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(nextButton).toBeDisabled();
    });
  });
});
