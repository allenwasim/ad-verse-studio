'use client';

import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import useSWR, { SWRConfiguration } from 'swr';
import { AccountEntry, Campaign, Notification, Admin } from './types';

const fetcher = async <T>(collectionName: string): Promise<T[]> => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
};

export const useAccounts = (config?: SWRConfiguration<AccountEntry[]>) => {
  const { data, error, isLoading } = useSWR<AccountEntry[]>('accounts', fetcher, config);
  return { data, error, isLoading };
};

export const useCampaigns = (config?: SWRConfiguration<Campaign[]>) => {
  const { data, error, isLoading } = useSWR<Campaign[]>('campaigns', fetcher, config);
  return { data, error, isLoading };
};

export const useNotifications = (config?: SWRConfiguration<Notification[]>) => {
    const { data, error, isLoading } = useSWR<Notification[]>('notifications', fetcher, config);
    return { data, error, isLoading };
};

export const useAdmins = (config?: SWRConfiguration<Admin[]>) => {
    const { data, error, isLoading } = useSWR<Admin[]>('admins', fetcher, config);
    return { data, error, isLoading };
};
