'use server';

import { revalidatePath } from 'next/cache';
import { Campaign, Lead, Screen, AccountEntry, Notification, Admin, Task, Reminder } from './types';
import * as data from './data';
import { adScreenCompatibilityChecker } from '@/ai/flows/ad-screen-compatibility-checker';
import { contractExpiryNotification } from '@/ai/flows/contract-expiry-notification';
import { leadFollowUpNotification } from '@/ai/flows/lead-followup-notification';
import { differenceInDays, isToday } from 'date-fns';

// Screen Actions
export async function saveScreen(formData: FormData) {
  const id = formData.get('id') as string;
  const venueName = formData.get('venueName') as string;
  const location = formData.get('location') as string;
  const uniqueID = formData.get('uniqueID') as string;

  if (!venueName || !location || !uniqueID) {
    return { success: false, message: 'Venue Name, Address, and Unique ID are required.' };
  }

  const latitude = parseFloat(formData.get('latitude') as string) || 0;
  const longitude = parseFloat(formData.get('longitude') as string) || 0;

  const screenData: Omit<Screen, 'id'> = {
    venueName,
    location,
    latitude,
    longitude,
    geohash: '0', // ngeohash.encode(latitude, longitude) - ngeohash is removed
    uniqueID,
    imageUrl: formData.get('imageUrl') as string || undefined,
    venueType: (formData.get('venueType') as 'restaurant' | 'cafe' | 'gym' | 'other') || 'other',
    contactPerson: (formData.get('contactPerson') as string) || '',
    phoneNumber: (formData.get('phoneNumber') as string) || '',
    averageFootfall: parseInt(formData.get('averageFootfall') as string) || 0,
    currentAds: [], // This would be updated separately
  };

  try {
    if (id) {
      await data.updateScreen(id, screenData);
    } else {
      await data.addScreen(screenData);
    }
    revalidatePath('/screens');
    revalidatePath('/campaigns');
    revalidatePath('/locations');
    return { success: true, message: `Screen ${id ? 'updated' : 'created'} successfully.` };
  } catch (error) {
    return { success: false, message: 'An error occurred while saving the screen.' };
  }
}

export async function deleteScreenAction(id: string) {
  await data.deleteScreen(id);
  
  const campaigns = await data.getCampaigns();
  for (const campaign of campaigns) {
      if (campaign.assignedScreens.includes(id)) {
          const updatedScreens = campaign.assignedScreens.filter(screenId => screenId !== id);
          await data.updateCampaign(campaign.id, { ...campaign, assignedScreens: updatedScreens });
      }
  }

  revalidatePath('/screens');
  revalidatePath('/campaigns');
  revalidatePath('/locations');
}

// Lead Actions
export async function saveLead(formData: FormData): Promise<{ success: boolean, message: string, lead?: Lead }> {
    try {
        const id = formData.get('id') as string;
        const leadName = formData.get('leadName') as string;
        const assignedTo = formData.get('assignedTo') as string;

        if (!leadName || !assignedTo) {
            return { success: false, message: 'Lead Name and Assigned To are required.' };
        }

        const currentLead = id ? await data.getLeadById(id) : undefined;
        const existingNotes = currentLead?.notes || [];
        
        const newNoteText = formData.get('notes') as string;
        const newNotes = newNoteText ? [...existingNotes, {
            noteText: newNoteText,
            createdAt: new Date(),
            createdBy: 'Admin', // In a real app, this would be the logged-in user
        }] : existingNotes;

        const leadData: Partial<Omit<Lead, 'tasks' | 'followUpDate'>> & { followUpDate: string | undefined } = {
            leadName,
            companyName: formData.get('companyName') as string || undefined,
            email: formData.get('email') as string || undefined,
            phoneNumber: formData.get('phoneNumber') as string || undefined,
            category: formData.get('category') as string || undefined,
            interestLevel: formData.get('interestLevel') as Lead['interestLevel'] || undefined,
            status: formData.get('status') as Lead['status'] || 'New',
            assignedTo,
            notes: newNotes,
            followUpDate: formData.get('followUpDate') as string | undefined,
        };

        let leadId = id;
        let savedLead: Lead | undefined;

        if (id) {
            await data.updateLead(id, {
                ...leadData,
                followUpDate: leadData.followUpDate ? new Date(leadData.followUpDate) : undefined,
            });
            savedLead = await data.getLeadById(id) || undefined;
        } else {
            const newLeadData: Omit<Lead, 'id'> = {
                leadName: leadData.leadName!,
                createdAt: new Date(),
                createdBy: 'Admin',
                notes: leadData.notes || [],
                status: leadData.status || 'New',
                interestLevel: leadData.interestLevel || 'Warm',
                assignedTo: leadData.assignedTo!,
                tasks: [],
                convertedCampaignId: undefined,
                followUpDate: leadData.followUpDate ? new Date(leadData.followUpDate) : undefined,
                companyName: leadData.companyName,
                email: leadData.email,
                phoneNumber: leadData.phoneNumber,
                category: leadData.category,
            };
            const newLeadId = await data.addLead(newLeadData);
            leadId = newLeadId;
            savedLead = await data.getLeadById(newLeadId) || undefined;
        }

        revalidatePath('/leads');

        if (leadData.status === 'Converted' && leadId && !currentLead?.convertedCampaignId) {
            const newCampaign: Omit<Campaign, 'id'> = {
                campaignName: `${leadData.leadName}'s First Campaign`,
                clientId: leadId,
                mediaType: 'image',
                mediaURL: '',
                slots: 1,
                assignedScreens: [],
                startDate: new Date(),
                endDate: new Date(),
                paymentStatus: 'Pending',
                amount: 0,
                paymentMode: 'Other',
                renewalReminder: true
            };
            const createdCampaignId = await data.addCampaign(newCampaign);
            await data.updateLead(leadId, { convertedCampaignId: createdCampaignId });
            revalidatePath('/campaigns');
        }

        return { success: true, message: `Lead ${id ? 'updated' : 'created'} successfully.`, lead: savedLead };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: errorMessage };
    }
}


export async function deleteLeadAction(id: string) {
  await data.deleteLead(id);
  revalidatePath('/leads');
}

// Campaign Actions
export async function saveCampaign(formData: FormData) {
  const id = formData.get('id') as string;

  const campaignName = formData.get('campaignName') as string;
  const clientId = formData.get('clientId') as string;
  const category = formData.get('category') as string;
  const mediaType = formData.get('mediaType') as 'image' | 'video';
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const amount = formData.get('amount') as string;

  if (!campaignName || !clientId || !mediaType || !startDate || !endDate || !amount) {
    return { success: false, message: 'Campaign Name, Client, Media Type, Start Date, End Date, and Amount are required.' };
  }

  const campaignData: Omit<Campaign, 'id' | 'startDate' | 'endDate'> & { startDate?: Date, endDate?: Date } = {
    campaignName,
    clientId,
    category,
    mediaType,
    mediaURL: formData.get('mediaURL') as string,
    mediaStoragePath: formData.get('mediaStoragePath') as string || undefined,
    mediaUrl: formData.get('mediaUrl') as string || undefined,
    mediaThumbnailUrl: formData.get('mediaThumbnailUrl') as string || undefined,
    mediaMetadata: formData.get('mediaMetadata') ? JSON.parse(formData.get('mediaMetadata') as string) : undefined,
    slots: Number(formData.get('slots')),
    assignedScreens: formData.getAll('assignedScreens') as string[],
    amount: Number(amount),
    paymentStatus: formData.get('paymentStatus') as 'Paid' | 'Pending' | 'Overdue',
    paymentMode: formData.get('paymentMode') as 'Cash' | 'UPI' | 'Bank' | 'Other',
    renewalReminder: formData.get('renewalReminder') === 'on',
  };
  
  campaignData.startDate = new Date(startDate);
  campaignData.endDate = new Date(endDate);
  
  try {
    if (id) {
      await data.updateCampaign(id, campaignData as Partial<Campaign>);
    } else {
      await data.addCampaign(campaignData as Omit<Campaign, 'id'>);
    }
    revalidatePath('/campaigns');
    revalidatePath('/screens');
    return { success: true, message: `Campaign ${id ? 'updated' : 'created'} successfully.` };
  } catch (error) {
    return { success: false, message: 'An error occurred while saving the campaign.' };
  }
}

export async function deleteCampaignAction(id: string) {
  await data.deleteCampaign(id);
  revalidatePath('/campaigns');
  revalidatePath('/screens');
}

// Account Entry Actions
export async function saveAccountEntry(formData: FormData) {
    const id = formData.get('id') as string;
    const entryType = formData.get('entryType') as 'Income' | 'Expense';
    const date = formData.get('date') as string;
    const amount = formData.get('amount') as string;

    if (!entryType || !date || !amount) {
      return { success: false, message: 'Entry Type, Date, and Amount are required.' };
    }

    const entryData: Partial<Omit<AccountEntry, 'id'>> = {
        entryType: entryType,
        amount: Number(amount),
        date: new Date(date),
        paymentMode: formData.get('paymentMode') as 'Cash' | 'UPI' | 'Bank' | 'Other',
        notes: formData.get('notes') as string | undefined,
        
        source: entryType === 'Income' ? (formData.get('source') as AccountEntry['source']) : undefined,
        relatedCampaignId: entryType === 'Income' ? (formData.get('relatedCampaignId') as string | undefined) : undefined,
        receivedFrom: entryType === 'Income' ? (formData.get('receivedFrom') as string | undefined) : undefined,
        incomeStatus: entryType === 'Income' ? (formData.get('incomeStatus') as AccountEntry['incomeStatus']) : undefined,
        
        category: entryType === 'Expense' ? (formData.get('category') as AccountEntry['category']) : undefined,
        paidTo: entryType === 'Expense' ? (formData.get('paidTo') as string | undefined) : undefined,
        expenseStatus: entryType === 'Expense' ? (formData.get('expenseStatus') as AccountEntry['expenseStatus']) : undefined,
    };

    try {
      if (id) {
          await data.updateAccountEntry(id, entryData);
      } else {
          await data.addAccountEntry(entryData as Omit<AccountEntry, 'id'>);
      }
      revalidatePath('/accounts');
      return { success: true, message: `Account entry ${id ? 'updated' : 'created'} successfully.` };
    } catch (error) {
      return { success: false, message: 'An error occurred while saving the account entry.' };
    }
}

export async function deleteAccountEntryAction(id: string) {
    await data.deleteAccountEntry(id);
    revalidatePath('/accounts');
}

// Admin Actions
export async function saveAdmin(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    if (!name) {
      return { success: false, message: 'Name is required.' };
    }

    const adminData: Omit<Admin, 'id'> = {
        name,
        email: formData.get('email') as string | undefined,
        phoneNumber: formData.get('phoneNumber') as string | undefined,
    };
    
    try {
      if (id) {
          await data.updateAdmin(id, adminData);
      } else {
          await data.addAdmin(adminData);
      }
      revalidatePath('/admins');
      revalidatePath('/leads'); // Revalidate leads in case admin name changed
      return { success: true, message: `Admin ${id ? 'updated' : 'created'} successfully.` };
    } catch (error) {
      return { success: false, message: 'An error occurred while saving the admin.' };
    }
}

export async function deleteAdminAction(id: string) {
    await data.deleteAdmin(id);
    revalidatePath('/admins');
    revalidatePath('/leads');
}

// Task Actions
export async function saveTask(formData: FormData): Promise<{ success: boolean; message: string; task?: Task }> {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const dueDate = formData.get('dueDate') as string;
  const assignedTo = formData.get('assignedTo') as string;
  const leadId = formData.get('leadId') as string;

  if (!title || !dueDate || !assignedTo || !leadId) {
    return { success: false, message: 'Title, Due Date, Assigned To, and Lead are required.' };
  }

  const taskData: Omit<Task, 'id'> = {
    title,
    dueDate: new Date(dueDate),
    completed: false,
    assignedTo,
    leadId,
  };

  try {
    let savedTask: Task | undefined = undefined;
    if (id) {
      await data.updateTask(id, taskData);
      savedTask = { ...taskData, id };
    } else {
      const newTaskId = await data.addTask(taskData);
      savedTask = { ...taskData, id: newTaskId };
      await data.addNotification({
          type: 'Task',
          message: `New task assigned: ${title}`,
          recipient: assignedTo,
          status: 'Pending',
          sentAt: new Date(),
          relatedLeadId: leadId,
          relatedTaskId: newTaskId,
      });
    }

    revalidatePath('/leads');
    revalidatePath('/notifications');
    return { success: true, message: `Task ${id ? 'updated' : 'created'} successfully.`, task: savedTask };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: 'An error occurred while saving the task.', task: undefined };
  }
}

export async function updateTaskStatus(taskId: string, completed: boolean) {
  try {
    await data.updateTask(taskId, { completed });
    revalidatePath('/leads');
    revalidatePath('/notifications');
    return { success: true, message: 'Task status updated.' };
  } catch (error) {
    return { success: false, message: 'An error occurred while updating the task status.' };
  }
}

// Notification Actions
export async function updateNotificationStatus(notificationId: string, status: 'Completed' | 'Dismissed') {
  try {
    await data.updateNotification(notificationId, { status });
    revalidatePath('/notifications');
    return { success: true, message: 'Notification status updated.' };
  } catch (error) {
    return { success: false, message: 'An error occurred while updating the notification status.' };
  }
}

export async function deleteNotificationAction(id: string) {
  await data.deleteNotification(id);
  revalidatePath('/notifications');
}

// GenAI Actions
export async function checkAdScreenCompatibility(adId: string, screenIds: string[]) {
    if (!adId || screenIds.length === 0) {
        return { error: 'Please select a campaign and at least one screen.' };
    }
    
    const allScreens = await data.getScreens();

    const result = await adScreenCompatibilityChecker({
        adId,
        screenIds,
        validScreenIds: allScreens.map(screen => screen.id),

    });

    return result;
}

export async function generateExpiryNotifications() {
  const allCampaigns = await data.getCampaigns();
  const allLeads = await data.getLeads();
  const allScreens = await data.getScreens();
  const allAdmins = await data.getAdmins();
  let generatedCount = 0;

  const expiringCampaigns = allCampaigns.filter(c => 
    c.renewalReminder &&
    differenceInDays(c.endDate, new Date()) <= 7 &&
    differenceInDays(c.endDate, new Date()) > 0
  );

  for (const campaign of expiringCampaigns) {
    const lead = allLeads.find(l => l.id === campaign.clientId);
    if (!lead || !lead.assignedTo) continue;
    
    const admin = allAdmins.find(a => a.id === lead.assignedTo);
    if (!admin) continue;

    const screenNames = campaign.assignedScreens.map(sId => {
      const screen = allScreens.find(s => s.id === sId);
      return screen ? screen.venueName : 'Unknown Screen';
    });

    const notificationTypes: ('Email' | 'WhatsApp' | 'SMS')[] = ['Email', 'WhatsApp', 'SMS'];
    
    for (const type of notificationTypes) {
      try {
        const result = await contractExpiryNotification({
          notificationType: type,
          contractId: campaign.id,
          clientName: lead.leadName,
          companyName: lead.companyName,
          screenNames: screenNames,
          endDate: campaign.endDate.toLocaleDateString(),
          amount: campaign.amount,
        });

        await data.addNotification({
          type: type,
          message: result.notificationMessage,
          recipient: admin.id,
          status: 'Pending',
          sentAt: new Date(),
        });
        generatedCount++;

      } catch (error) {
 console.error(`Failed to generate ${type} notification for campaign ${campaign.id}:`, error);
      }
    }
  }
  
  revalidatePath('/notifications');
  return { generatedCount };
}

export async function generateFollowUpNotifications() {
  const allLeads = await data.getLeads();
  const allAdmins = await data.getAdmins();
  let generatedCount = 0;

  const leadsForFollowUp = allLeads.filter(l => 
    l.followUpDate && isToday(l.followUpDate)
  );

  for (const lead of leadsForFollowUp) {
     if (!lead.assignedTo) continue;
    const admin = allAdmins.find(a => a.id === lead.assignedTo);
    if (!admin) continue;

    try {
      const result = await leadFollowUpNotification({
        leadName: lead.leadName,
        adminName: admin.name,
      });

      await data.addNotification({
        type: 'FollowUp',
        message: result.notificationMessage,
        recipient: admin.id,
        status: 'Pending',
        sentAt: new Date(),
        relatedLeadId: lead.id,
      });
      generatedCount++;
    } catch (error) {
      console.error(`Failed to generate follow-up notification for lead ${lead.id}:`, error);
    }
  }

  revalidatePath('/notifications');
  return { generatedCount };
}

// Reminder Actions
export async function addReminder(reminder: Omit<Reminder, 'id'>) {
    try {
        await data.addReminder(reminder);
        revalidatePath('/notifications');
        return { success: true, message: 'Reminder added successfully.' };
    } catch (error) {
        return { success: false, message: 'An error occurred while adding the reminder.' };
    }
}
