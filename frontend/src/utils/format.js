export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
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
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info',
    approved: 'success',
    rejected: 'danger',
  };
  return colors[status] || 'info';
};

export const getRoleBadge = (role) => {
  const badges = {
    guest: 'bg-blue-100 text-blue-800',
    host: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800',
    payment_manager: 'bg-yellow-100 text-yellow-800',
    field_inspector: 'bg-indigo-100 text-indigo-800',
  };
  return badges[role] || 'bg-gray-100 text-gray-800';
};