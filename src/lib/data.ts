import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { AccountEntry, Campaign, Lead, Screen, Admin, Task, Notification, Reminder } from './types';
import { unstable_noStore as noStore } from 'next/cache';

// Helper to remove undefined values from an object
const removeUndefined = <T extends object>(obj: T): Partial<T> => {
    const newObj: Partial<T> = {};
    Object.keys(obj).forEach(keyStr => {
        const key = keyStr as keyof T;
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

// Helper to convert Firestore Timestamps
const convertTimestamps = <T extends object>(data: T): T => {
  const fieldsToConvert: (keyof T)[] = ['date', 'startDate', 'endDate', 'dueDate', 'createdAt', 'followUpDate', 'sentAt', 'remindAt'] as (keyof T)[];
  const convertedData = { ...data };

  for (const field of fieldsToConvert) {
    const fieldValue = convertedData[field];
    if (fieldValue instanceof Timestamp) {
      convertedData[field] = fieldValue.toDate() as T[keyof T];
    }
  }

  if ('notes' in convertedData && Array.isArray(convertedData.notes)) {
    convertedData.notes = convertedData.notes.map(convertTimestamps);
  }

  if ('tasks' in convertedData && Array.isArray(convertedData.tasks)) {
    convertedData.tasks = convertedData.tasks.map(convertTimestamps);
  }

  return convertedData;
};


// Account Entries
export async function getAccountEntries(): Promise<AccountEntry[]> {
  noStore();
  const querySnapshot = await getDocs(collection(db, "accounts"));
  return querySnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as AccountEntry);
}

export const addAccountEntry = async (entry: Omit<AccountEntry, 'id'>) => {
    const docRef = await addDoc(collection(db, 'accounts'), removeUndefined(entry));
    return docRef.id;
};

export const updateAccountEntry = async (id: string, entry: Partial<AccountEntry>) => {
    const docRef = doc(db, 'accounts', id);
    await updateDoc(docRef, removeUndefined(entry));
};

export const deleteAccountEntry = async (id: string) => {
    const docRef = doc(db, 'accounts', id);
    await deleteDoc(docRef);
};


// Campaigns
export async function getCampaigns(): Promise<Campaign[]> {
  noStore();
  const querySnapshot = await getDocs(collection(db, "campaigns"));
  return querySnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Campaign);
}

export const addCampaign = async (campaign: Omit<Campaign, 'id'>) => {
    const docRef = await addDoc(collection(db, 'campaigns'), removeUndefined(campaign));
    return docRef.id;
};

export const updateCampaign = async (id: string, campaign: Partial<Campaign>) => {
    const docRef = doc(db, 'campaigns', id);
    await updateDoc(docRef, removeUndefined(campaign));
};

export const deleteCampaign = async (id: string) => {
    const docRef = doc(db, 'campaigns', id);
    await deleteDoc(docRef);
};


// Leads
export async function getLeads(): Promise<Lead[]> {
    noStore();
    const querySnapshot = await getDocs(collection(db, "leads"));
    return querySnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Lead);
}

export async function getLeadById(id: string): Promise<Lead | null> {
    noStore();
    const docRef = doc(db, 'leads', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return convertTimestamps({ ...docSnap.data(), id: docSnap.id }) as Lead;
}

export const addLead = async (lead: Omit<Lead, 'id'>) => {
    const docRef = await addDoc(collection(db, 'leads'), removeUndefined(lead));
    return docRef.id;
};

export const updateLead = async (id: string, lead: Partial<Lead>) => {
    const docRef = doc(db, 'leads', id);
    await updateDoc(docRef, removeUndefined(lead));
};

export const deleteLead = async (id: string) => {
    const docRef = doc(db, 'leads', id);
    await deleteDoc(docRef);
};


// Screens
export async function getScreens(): Promise<Screen[]> {
    noStore();
    const querySnapshot = await getDocs(collection(db, "screens"));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Screen);
}

export const addScreen = async (screen: Omit<Screen, 'id'>) => {
    const docRef = await addDoc(collection(db, 'screens'), removeUndefined(screen));
    return docRef.id;
};

export const updateScreen = async (id: string, screen: Partial<Screen>) => {
    const docRef = doc(db, 'screens', id);
    await updateDoc(docRef, removeUndefined(screen));
};

export const deleteScreen = async (id: string) => {
    const docRef = doc(db, 'screens', id);
    await deleteDoc(docRef);
};

// Admins
export async function getAdmins(): Promise<Admin[]> {
    noStore();
    const querySnapshot = await getDocs(collection(db, "admins"));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Admin);
}

export const addAdmin = async (admin: Omit<Admin, 'id'>) => {
    const docRef = await addDoc(collection(db, 'admins'), removeUndefined(admin));
    return docRef.id;
};

export const updateAdmin = async (id: string, admin: Partial<Admin>) => {
    const docRef = doc(db, 'admins', id);
    await updateDoc(docRef, removeUndefined(admin));
};

export const deleteAdmin = async (id: string) => {
    const docRef = doc(db, 'admins', id);
    await deleteDoc(docRef);
};


// Tasks
export async function getTasks(): Promise<Task[]> {
    noStore();
    const querySnapshot = await getDocs(collection(db, "tasks"));
    return querySnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Task);
}

export const addTask = async (task: Omit<Task, 'id'>) => {
    const docRef = await addDoc(collection(db, 'tasks'), removeUndefined(task));
    return docRef.id;
};

export const updateTask = async (id: string, task: Partial<Task>) => {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, removeUndefined(task));
};

export const deleteTask = async (id: string) => {
    const docRef = doc(db, 'tasks', id);
    await deleteDoc(docRef);
};


// Notifications
export async function getNotifications(): Promise<Notification[]> {
    noStore();
    const querySnapshot = await getDocs(collection(db, "notifications"));
    return querySnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Notification);
}

export const addNotification = async (notification: Omit<Notification, 'id'>) => {
    const docRef = await addDoc(collection(db, 'notifications'), removeUndefined(notification));
    return docRef.id;
};

export const updateNotification = async (id: string, notification: Partial<Notification>) => {
    const docRef = doc(db, 'notifications', id);
    await updateDoc(docRef, removeUndefined(notification));
};

export const deleteNotification = async (id: string) => {
    const docRef = doc(db, 'notifications', id);
    await deleteDoc(docRef);
};

// Reminders
export async function getReminders(): Promise<Reminder[]> {
    noStore();
    const querySnapshot = await getDocs(collection(db, "reminders"));
    return querySnapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as Reminder);
}

export const addReminder = async (reminder: Omit<Reminder, 'id'>) => {
    const docRef = await addDoc(collection(db, 'reminders'), removeUndefined(reminder));
    return docRef.id;
};
