export type Task = {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  assignedTo: string; // Admin ID
  leadId: string;
};

export type Screen = {
  id: string;
  venueName: string;
  location: string;
  latitude: number;
  longitude: number;
  geohash: string;
  uniqueID: string;
  imageUrl?: string;
  venueType?: 'restaurant' | 'cafe' | 'gym' | 'other';
  contactPerson?: string;
  phoneNumber?: string;
  currentAds: string[]; // array of Ad IDs
  averageFootfall?: number;
};

export type MediaMetadata = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dimensions?: string;
  duration?: number;
  thumbnail?: string;
  originalName?: string;
};

export type Campaign = {
  id: string;
  campaignName: string;
  clientId: string; // reference to Lead ID
  clientName?: string; // independent client name
  category?: string;
  mediaType: 'image' | 'video';
  mediaURL: string; // Legacy field for backward compatibility
  mediaMetadata?: MediaMetadata;
  mediaStoragePath?: string;
  mediaUrl?: string; // New field from Firebase Storage
  mediaThumbnailUrl?: string;

  slots: number;

  assignedScreens: string[]; // array of Screen IDs

  startDate: Date;
  endDate: Date;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank' | 'Other';
  renewalReminder: boolean;
};

export type Lead = {
  id: string;
  leadName: string;
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  category?: string;
  interestLevel: 'Hot' | 'Warm' | 'Cold';
  assignedTo: string; // Admin ID
  status: 'New' | 'Contacted' | 'In Negotiation' | 'Converted' | 'Lost';
  notes: Array<{
    noteText: string;
    createdAt: Date;
    createdBy: string; // Admin ID/Name
  }>;
  tasks: Task[];
  createdAt: Date;
  createdBy: string; // Admin ID/Name
  followUpDate?: Date;
  convertedCampaignId?: string; // Reference to Campaign ID
};

export type Notification = {
  id: string;
  type: 'Email' | 'WhatsApp' | 'SMS' | 'Task' | 'FollowUp';
  message: string;
  recipient: string; // Admin ID
  sentAt: Date;
  status: 'Pending' | 'Sent' | 'Failed' | 'Completed' | 'Dismissed';
  relatedLeadId?: string;
  relatedTaskId?: string;
};

export type AccountEntry = {
  id: string;
  entryType: 'Income' | 'Expense';
  amount: number;
  date: Date;
  paymentMode: 'Cash' | 'UPI' | 'Bank' | 'Other';
  notes?: string;
  
  source?: 'Ad Booking' | 'Client Payment' | 'Sponsorship' | 'Other';
  relatedCampaignId?: string; 
  receivedFrom?: string;
  incomeStatus?: 'Paid' | 'Pending' | 'Overdue';

  category?: 'Rent' | 'Equipment' | 'Staff' | 'Marketing' | 'Other';
  paidTo?: string;
  expenseStatus?: 'Paid' | 'Pending';
};

export type Admin = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
};

export type Reminder = {
    id: string;
    title: string;
    remindAt: Date;
};
