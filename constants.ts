
import { TimelineEvent } from './types';

export const ITEMS_PER_PAGE = 5;

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 1, patientName: 'Jessica Wilson', action: 'Pre-Auth Submitted for CPT 99213.', timestamp: '2 hours ago', icon: 'submit' },
  { id: 2, patientName: 'John Doe', action: 'Pre-Authorization was Approved.', timestamp: '8 hours ago', icon: 'approved' },
  { id: 3, patientName: 'James Thomas', action: 'Eligibility check completed: Eligible.', timestamp: 'Yesterday', icon: 'check' },
  { id: 4, patientName: 'Robert Johnson', action: 'Pre-Authorization was Rejected.', timestamp: '2 days ago', icon: 'rejected' },
  { id: 5, patientName: 'Linda Jackson', action: 'Eligibility check is Pending.', timestamp: '3 days ago', icon: 'pending' },
];
