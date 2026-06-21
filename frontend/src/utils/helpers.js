export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDatetime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    online: 'text-green-600',
    offline: 'text-red-600',
    starting: 'text-yellow-600',
    stopping: 'text-yellow-600',
  };
  return colors[status] || 'text-gray-600';
};

export const getStatusBgColor = (status) => {
  const colors = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800',
    starting: 'bg-yellow-100 text-yellow-800',
    stopping: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
