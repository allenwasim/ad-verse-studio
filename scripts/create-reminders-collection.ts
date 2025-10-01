import { db } from '../src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

async function createRemindersCollection() {
  try {
    const docRef = await addDoc(collection(db, 'reminders'), {
        title: 'Test Reminder',
        remindAt: new Date(),
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

createRemindersCollection();
