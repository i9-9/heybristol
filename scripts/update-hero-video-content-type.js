const { createClient } = require('contentful-management');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function updateHeroVideoContentType() {
  try {
    console.log('🔄 Updating HeroVideo content type...');
    
    const spaceId = process.env.CONTENTFUL_SPACE_ID || process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
    if (!spaceId) {
      throw new Error('CONTENTFUL_SPACE_ID or NEXT_PUBLIC_CONTENTFUL_SPACE_ID is required');
    }
    
    console.log(`📍 Using Space ID: ${spaceId}`);
    
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    
    // Get the existing content type
    const contentType = await environment.getContentType('heroVideo');
    
    // First, omit old URL fields
    const fieldsToRemove = ['webmUrl', 'mp4Url', 'mobileUrl'];
    for (const fieldId of fieldsToRemove) {
      const field = contentType.fields.find(f => f.id === fieldId);
      if (field) {
        console.log(`🗑️  Omitting field: ${fieldId}`);
        field.omitted = true;
      }
    }
    
    // Step 1: Update to omit fields
    console.log('📝 Step 1: Omitting old fields...');
    const updatedContentType = await contentType.update();
    await updatedContentType.publish();
    
    // Step 2: Get the updated content type and add new fields
    console.log('📝 Step 2: Adding new Asset fields...');
    const contentType2 = await environment.getContentType('heroVideo');
    
    // Add new Asset fields
    const newFields = [
      {
        id: 'webmVideo',
        name: 'WebM Video',
        type: 'Link',
        linkType: 'Asset',
        required: false,
        validations: [
          {
            linkMimetypeGroup: ['video']
          }
        ]
      },
      {
        id: 'mp4Video',
        name: 'MP4 Video',
        type: 'Link',
        linkType: 'Asset',
        required: false,
        validations: [
          {
            linkMimetypeGroup: ['video']
          }
        ]
      },
      {
        id: 'mobileVideo',
        name: 'Mobile Video',
        type: 'Link',
        linkType: 'Asset',
        required: false,
        validations: [
          {
            linkMimetypeGroup: ['video']
          }
        ]
      }
    ];
    
    for (const field of newFields) {
      if (!contentType2.fields.find(f => f.id === field.id)) {
        console.log(`➕ Adding field: ${field.id}`);
        contentType2.fields.push(field);
      }
    }
    
    // Update and publish the content type with new fields
    const finalContentType = await contentType2.update();
    await finalContentType.publish();
    
    console.log('✅ HeroVideo content type updated successfully!');
    console.log('📝 Next steps:');
    console.log('1. Go to Contentful and upload your video files as Assets');
    console.log('2. Update your HeroVideo entries to reference the new Asset fields');
    console.log('3. Publish the entries');
    
  } catch (error) {
    console.error('❌ Error updating content type:', error);
  }
}

updateHeroVideoContentType();
