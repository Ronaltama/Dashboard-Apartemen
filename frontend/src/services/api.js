const API_BASE_URL = 'http://localhost:5000/api';

// Fetch all floors
export const getFloors = async () => {
  const response = await fetch(`${API_BASE_URL}/floors`);
  if (!response.ok) throw new Error('Failed to fetch floors');
  return response.json();
};

// Fetch rooms by floor ID
export const getRoomsByFloor = async (floorId) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${floorId}`);
  if (!response.ok) throw new Error('Failed to fetch rooms');
  return response.json();
};

// Fetch energy data for a room
export const getEnergyData = async (roomId, period = 'daily', params = {}) => {
  const url = new URL(`${API_BASE_URL}/energy/${roomId}`);
  url.searchParams.append('period', period);
  
  // Add parameters based on filter type
  if (period === 'daily' && params.date) {
    url.searchParams.append('date', params.date);
  } else if (period === 'weekly' && params.startDate && params.endDate) {
    url.searchParams.append('startDate', params.startDate);
    url.searchParams.append('endDate', params.endDate);
  } else if (period === 'monthly' && params.month) {
    url.searchParams.append('month', params.month);
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch energy data');
  return response.json();
};

// Download energy report
export const downloadReport = async (roomId, period = 'daily', params = {}) => {
  const url = new URL(`${API_BASE_URL}/energy/${roomId}/report`);
  url.searchParams.append('period', period);
  
  // Add parameters based on filter type
  if (period === 'daily' && params.date) {
    url.searchParams.append('date', params.date);
  } else if (period === 'weekly' && params.startDate && params.endDate) {
    url.searchParams.append('startDate', params.startDate);
    url.searchParams.append('endDate', params.endDate);
  } else if (period === 'monthly' && params.month) {
    url.searchParams.append('month', params.month);
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to download report');
  }
  
  // Create blob from response
  const blob = await response.blob();
  
  // Create download link and trigger download
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  
  // Extract filename from content-disposition header or generate one
  const contentDisposition = response.headers.get('content-disposition');
  let filename = `energy-report-${roomId}-${period}.pdf`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch && filenameMatch.length === 2) {
      filename = filenameMatch[1];
    }
  }
  
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};