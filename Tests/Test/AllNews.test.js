import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllNews from './AllNews';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mock
fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

test('initially renders loader', () => {
  render(<AllNews />);
  
  // Expect loader to be in the document initially
  expect(screen.getByTestId('loader')).toBeInTheDocument();
});

test('renders articles after successful fetch', async () => {
  // Mock a successful API response
  fetchMock.mockResponseOnce(JSON.stringify({
    success: true,
    data: {
      totalResults: 2,
      articles: [
        {
          title: 'News 1',
          description: 'Description 1',
          urlToImage: 'image-url-1',
          publishedAt: '2024-10-01',
          url: 'url-1',
          author: 'Author 1',
          source: { name: 'Source 1' }
        },
        {
          title: 'News 2',
          description: 'Description 2',
          urlToImage: 'image-url-2',
          publishedAt: '2024-10-02',
          url: 'url-2',
          author: 'Author 2',
          source: { name: 'Source 2' }
        }
      ]
    }
  }));

  render(<AllNews />);

  // Wait for articles to be displayed
  await waitFor(() => {
    expect(screen.getByText('News 1')).toBeInTheDocument();
    expect(screen.getByText('News 2')).toBeInTheDocument();
  });

  // Check if the pagination is displayed correctly
  expect(screen.getByText('1 of 1')).toBeInTheDocument();
});

test('displays error message on fetch failure', async () => {
  // Mock a failed API response
  fetchMock.mockReject(new Error('Failed to fetch'));

  render(<AllNews />);

  // Wait for error message to appear
  await waitFor(() => {
    expect(screen.getByText('Failed to fetch news. Please try again later.')).toBeInTheDocument();
  });
});

test('filters articles containing "[Removed]" in title or description', async () => {
  // Mock a successful API response with articles to be filtered
  fetchMock.mockResponseOnce(JSON.stringify({
    success: true,
    data: {
      totalResults: 2,
      articles: [
        {
          title: 'News 1',
          description: 'Description 1',
          urlToImage: 'image-url-1',
          publishedAt: '2024-10-01',
          url: 'url-1',
          author: 'Author 1',
          source: { name: 'Source 1' }
        },
        {
          title: '[Removed] News',
          description: '[Removed] Description',
          urlToImage: 'image-url-2',
          publishedAt: '2024-10-02',
          url: 'url-2',
          author: 'Author 2',
          source: { name: 'Source 2' }
        }
      ]
    }
  }));

  render(<AllNews />);

  // Wait for articles to be filtered and displayed
  await waitFor(() => {
    expect(screen.getByText('News 1')).toBeInTheDocument();
    expect(screen.queryByText('[Removed] News')).not.toBeInTheDocument();
  });
});

test('pagination works correctly', async () => {
  // Mock an API response with more pages of data
  fetchMock.mockResponseOnce(JSON.stringify({
    success: true,
    data: {
      totalResults: 24,
      articles: Array.from({ length: 12 }, (_, index) => ({
        title: `News ${index + 1}`,
        description: `Description ${index + 1}`,
        urlToImage: `image-url-${index + 1}`,
        publishedAt: '2024-10-01',
        url: `url-${index + 1}`,
        author: `Author ${index + 1}`,
        source: { name: `Source ${index + 1}` }
      }))
    }
  }));

  render(<AllNews />);

  // Wait for articles to be displayed
  await waitFor(() => {
    expect(screen.getByText('News 1')).toBeInTheDocument();
  });

  // Check that the "Next" button is enabled
  const nextButton = screen.getByText('Next →');
  expect(nextButton).not.toBeDisabled();

  // Simulate clicking "Next" button
  fireEvent.click(nextButton);

  // Mock second page of data
  fetchMock.mockResponseOnce(JSON.stringify({
    success: true,
    data: {
      totalResults: 24,
      articles: Array.from({ length: 12 }, (_, index) => ({
        title: `News ${index + 13}`,
        description: `Description ${index + 13}`,
        urlToImage: `image-url-${index + 13}`,
        publishedAt: '2024-10-02',
        url: `url-${index + 13}`,
        author: `Author ${index + 13}`,
        source: { name: `Source ${index + 13}` }
      }))
    }
  }));

  // Wait for next page articles to load
  await waitFor(() => {
    expect(screen.getByText('News 13')).toBeInTheDocument();
  });
});
