# Audio Track Contentful Setup

This guide explains how to set up the audio track content type in Contentful for the Bristol project.

## Prerequisites

1. **Contentful Account**: You need a Contentful account with a space
2. **Management Token**: You need a Contentful Management API token
3. **Environment Variables**: Configure your `.env.local` file

## Environment Setup

Create or update your `.env.local` file with:

```bash
# Contentful Configuration
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_ACCESS_TOKEN=your_access_token_here
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here

# Client-side variables
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=your_space_id_here
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
```

### How to get these values:

1. **Space ID**: Contentful Dashboard → Settings → General settings
2. **Access Token**: Contentful Dashboard → Settings → API keys → Content delivery / preview tokens
3. **Management Token**: Contentful Dashboard → Settings → API keys → Personal access tokens

## Step 1: Create the Content Type

Run the script to create the `audioTrack` content type:

```bash
node scripts/create-audio-content-type.js
```

This will create a content type with the following fields:

- **ID**: Unique identifier (required)
- **Title**: Display name (required)
- **Audio File**: Audio asset (required, MP3/WAV/M4A/OGG)

**Note**: Audio will always loop and play at 50% volume. No fade effects are applied.

## Step 2: Create Sample Entries

Run the script to create sample audio track entries:

```bash
node scripts/create-sample-audio-tracks.js
```

This creates three sample audio tracks:
- Ambient Music 1
- Cinematic Score 1  
- Electronic Beat 1

## Step 3: Upload Audio Files

1. Go to **Contentful Dashboard** → **Content** → **Audio Track**
2. Edit each audio track entry
3. Upload an audio file in the **Audio File** field
4. Supported formats: MP3, WAV, M4A, OGG
5. Publish the entries

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Visit your site and check the browser console
3. You should see logs like: `🎵 Audio track fijo cargado: [title]`

## How It Works

- **Fixed Audio**: The system selects ONE audio track at build time (cached for 5 minutes)
- **Random Video**: Videos are randomized on every page load
- **Control**: You can change the audio track in Contentful, and it will update within 5 minutes

## Troubleshooting

### "Content type audioTrack no existe"
- Run `node scripts/create-audio-content-type.js` first

### "CONTENTFUL_MANAGEMENT_TOKEN es requerido"
- Check your `.env.local` file has the management token
- Or run: `CONTENTFUL_MANAGEMENT_TOKEN=your_token node scripts/create-audio-content-type.js`

### Audio not playing
- Check that audio files are uploaded and published in Contentful
- Verify the audio file format is supported
- Check browser console for errors

### Same audio every time
- This is expected behavior! Audio is fixed and controlled from Contentful
- To change the audio, edit the audio track in Contentful
- Changes will be live within 5 minutes due to ISR caching

## Content Management

To change the audio track:

1. Go to Contentful Dashboard
2. Edit the audio track you want to use
3. Make sure it has the highest `order` value (or modify the selection logic)
4. Publish the changes
5. The new audio will be live within 5 minutes

## Advanced Configuration

You can modify the audio selection logic in `src/lib/contentful.ts`:

```typescript
// Current: Random selection
export async function getRandomAudioTrack(): Promise<AudioTrack | null> {
  const audioTracks = await getAudioTracksFromContentful();
  const randomIndex = Math.floor(Math.random() * audioTracks.length);
  return audioTracks[randomIndex];
}

// Alternative: Select by order (highest order wins)
export async function getPrimaryAudioTrack(): Promise<AudioTrack | null> {
  const audioTracks = await getAudioTracksFromContentful();
  return audioTracks.sort((a, b) => (b.order || 0) - (a.order || 0))[0];
}
```
