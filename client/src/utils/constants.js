export const BENGALURU_DEFAULT_CENTER = {
  latitude: 12.9716,
  longitude: 77.6412,
  address: 'Indiranagar, Bengaluru, Karnataka',
};

export const PROFESSIONS = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Mechanic',
  'AC Technician',
  'Appliance Repair',
  'Cleaning Professional',
];

export const BOOKING_STATUS_CONFIG = {
  SEARCHING: {
    label: 'Searching KaamSaathi',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Finding the nearest online professional within your area...',
    step: 1,
  },
  REQUESTED: {
    label: 'Request Sent to Worker',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Waiting for the nearest KaamSaathi to accept your job request...',
    step: 1,
  },
  ACCEPTED: {
    label: 'Worker Assigned',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Your KaamSaathi has accepted the job and is preparing to depart.',
    step: 2,
  },
  ON_THE_WAY: {
    label: 'On the Way',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Your KaamSaathi is travelling to your location. Live GPS tracking is active.',
    step: 3,
  },
  ARRIVED: {
    label: 'Arrived at Location',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Your KaamSaathi has reached your service address.',
    step: 4,
  },
  IN_PROGRESS: {
    label: 'Work in Progress',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Service work is currently underway.',
    step: 5,
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Service has been completed successfully.',
    step: 6,
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'This booking was cancelled.',
    step: 0,
  },
  NO_WORKER_FOUND: {
    label: 'No Worker Available',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'No nearby online KaamSaathi could accept right now. You can retry dispatch.',
    step: 0,
  },
};

export const ACTIVE_BOOKING_STATUSES = [
  'SEARCHING',
  'REQUESTED',
  'ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS',
];

export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}
