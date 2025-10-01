#!/usr/bin/env tsx

/**
 * Migration script to move existing Data URL images to Firebase Storage
 * Run this script to migrate existing campaign media from Firestore to Firebase Storage
 */

import { db, storage } from '../src/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Campaign } from '../src/lib/types';

interface MigrationResult {
  totalCampaigns: number;
  campaignsWithDataUrls: number;
  successfulMigrations: number;
  failedMigrations: number;
  errors: Array<{ campaignId: string; campaignName: string; error: string }>;
}

async function migrateCampaignMedia(): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalCampaigns: 0,
    campaignsWithDataUrls: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
    errors: []
  };

  console.log('🚀 Starting migration of campaign media from Data URLs to Firebase Storage...');

  try {
    // Get all campaigns
    const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
    result.totalCampaigns = campaignsSnapshot.docs.length;

    console.log(`📊 Found ${result.totalCampaigns} campaigns to check`);

    for (const campaignDoc of campaignsSnapshot.docs) {
      const campaignData = campaignDoc.data() as Campaign;
      const campaignId = campaignDoc.id;

      // Check if campaign has a Data URL mediaURL
      if (campaignData.mediaURL && campaignData.mediaURL.startsWith('data:image/')) {
        result.campaignsWithDataUrls++;
        console.log(`\n📝 Processing campaign: ${campaignData.campaignName} (${campaignId})`);

        try {
          // Extract image data from Data URL
          const matches = campaignData.mediaURL.match(/^data:(.+?);base64,(.+)$/);
          if (!matches || matches.length !== 3) {
            throw new Error('Invalid Data URL format');
          }

          const mimeType = matches[1];
          const base64Data = matches[2];

          // Generate filename based on campaign name and timestamp
          const timestamp = Date.now();
          const sanitizedName = campaignData.campaignName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
          const extension = mimeType.split('/')[1] || 'jpg';
          const filename = `${sanitizedName}_${timestamp}.${extension}`;

          // Create storage path
          const storagePath = `campaign-media/${campaignId}/${filename}`;
          const storageRef = ref(storage, storagePath);

          console.log(`📤 Uploading to: ${storagePath}`);

          // Upload image to Firebase Storage
          await uploadString(storageRef, base64Data, 'base64', {
            contentType: mimeType,
            customMetadata: {
              originalName: filename,
              migratedAt: new Date().toISOString(),
              migrationScript: 'migrate-campaign-media.ts'
            }
          });

          // Get download URL
          const downloadURL = await getDownloadURL(storageRef);

          // Get image dimensions (create an image element to measure)
          const dimensions = await getImageDimensions(campaignData.mediaURL);

          // Update campaign document with new storage information
          const updateData: Partial<Campaign> = {
            mediaStoragePath: storagePath,
            mediaUrl: downloadURL,
            mediaMetadata: {
              name: filename,
              size: Math.round((base64Data.length * 3) / 4), // Approximate size
              type: mimeType,
              lastModified: timestamp,
              dimensions: `${dimensions.width}x${dimensions.height}`,
              originalName: campaignData.campaignName
            }
          };

          // Keep the original mediaURL for backward compatibility during transition
          await updateDoc(doc(db, 'campaigns', campaignId), updateData);

          result.successfulMigrations++;
          console.log(`✅ Successfully migrated: ${campaignData.campaignName}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.failedMigrations++;
          result.errors.push({
            campaignId,
            campaignName: campaignData.campaignName,
            error: errorMessage
          });
          console.error(`❌ Failed to migrate campaign ${campaignData.campaignName}:`, errorMessage);
        }
      } else {
        console.log(`⏭️  Skipping campaign: ${campaignData.campaignName} (no Data URL found)`);
      }
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }

  return result;
}

async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for dimension detection'));
    };
    img.src = dataUrl;
  });
}

async function rollbackMigration(): Promise<void> {
  console.log('🔄 Rolling back migration...');

  try {
    const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
    let rollbackCount = 0;

    for (const campaignDoc of campaignsSnapshot.docs) {
      const campaignData = campaignDoc.data() as Campaign;
      const campaignId = campaignDoc.id;

      // If campaign has storage path but no original Data URL, we can't fully rollback
      if (campaignData.mediaStoragePath && campaignData.mediaURL && !campaignData.mediaURL.startsWith('data:')) {
        console.log(`⚠️  Cannot fully rollback ${campaignData.campaignName} - original Data URL not preserved`);
        continue;
      }

      // Remove storage-specific fields but keep original Data URL if it exists
      if (campaignData.mediaStoragePath) {
        const updateData: Partial<Campaign> = {
          mediaStoragePath: undefined,
          mediaUrl: undefined,
          mediaThumbnailUrl: undefined,
          mediaMetadata: undefined
        };

        await updateDoc(doc(db, 'campaigns', campaignId), updateData);
        rollbackCount++;
        console.log(`✅ Rolled back: ${campaignData.campaignName}`);
      }
    }

    console.log(`📊 Rollback completed for ${rollbackCount} campaigns`);
    console.log('⚠️  Note: Files in Firebase Storage were not deleted. Manual cleanup may be required.');

  } catch (error) {
    console.error('💥 Rollback failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🔧 Campaign Media Migration Tool');
  console.log('===================================');

  try {
    if (command === 'migrate') {
      const result = await migrateCampaignMedia();

      console.log('\n📊 Migration Summary:');
      console.log(`Total campaigns: ${result.totalCampaigns}`);
      console.log(`Campaigns with Data URLs: ${result.campaignsWithDataUrls}`);
      console.log(`✅ Successful migrations: ${result.successfulMigrations}`);
      console.log(`❌ Failed migrations: ${result.failedMigrations}`);

      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(error => {
          console.log(`  - ${error.campaignName}: ${error.error}`);
        });
      }

      if (result.successfulMigrations > 0) {
        console.log('\n🎉 Migration completed successfully!');
        console.log('💡 Next steps:');
        console.log('  1. Test that campaigns display correctly with new storage URLs');
        console.log('  2. Once verified, you can optionally remove the old mediaURL fields');
        console.log('  3. Monitor Firebase Storage usage and costs');
      }

    } else if (command === 'rollback') {
      await rollbackMigration();
      console.log('\n🔄 Rollback completed!');

    } else {
      console.log('\nUsage:');
      console.log('  tsx migrate-campaign-media.ts migrate   - Migrate Data URLs to Firebase Storage');
      console.log('  tsx migrate-campaign-media.ts rollback  - Remove storage fields (keeps Data URLs)');
    }

  } catch (error) {
    console.error('\n💥 Operation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { migrateCampaignMedia, rollbackMigration };