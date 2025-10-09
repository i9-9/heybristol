# Fix: Videos Loading Infinitely in Production

## Problem
Videos in the `/directors/[slug]/[videoSlug]` pages were getting stuck in an infinite loading state in production.

## Root Causes Identified

### 1. Missing Hash Support for Private Videos
The Vimeo Player was not passing the privacy hash for private/unlisted videos. When videos are configured as private in Vimeo, they require a hash parameter to be played.

### 2. Insufficient Error Handling
The player didn't have proper error handling or timeout detection, causing infinite loading without user feedback.

### 3. DOM Element Wait Time
The player was only waiting 1 second (10 retries × 100ms) for the DOM element to be available, which might not be enough in production builds.

## Changes Made

### 1. Hook: `useVimeoPlayer.ts`
- **Added hash support**: The hook now accepts a `hash` parameter in options
- **Improved URL construction**: When hash is provided, uses full URL format: `https://player.vimeo.com/video/{videoId}?h={hash}`
- **Extended wait time**: Increased DOM element wait time from 1s to 3s (30 retries)
- **Enhanced logging**: Added comprehensive console logging for debugging
- **Better error handling**: Player now sets ready state to true even on error to prevent infinite loading
- **Error event listener**: Added error event listener to catch and handle Vimeo player errors

### 2. Component: `VideoPlayer.tsx`
- **Hash propagation**: Component now passes `video.hash` to the hook
- **Loading timeout detection**: Added 10-second timeout to detect stuck loading
- **Error state UI**: Added user-friendly error message with retry button
- **Better UX**: Users now see a clear error message instead of infinite loading spinner

### 3. Data Flow
```
Director Video Data → VideoItem (with hash) → VideoPlayer → useVimeoPlayer → Vimeo Player (with hash)
```

## Testing Recommendations

### Before Deployment
1. **Test with private videos**: Ensure private videos have hash in the data
2. **Test without hash**: Verify public videos still work
3. **Test error scenarios**: Try with invalid video IDs to see error message
4. **Check console logs**: Review logs in production to identify issues

### Adding Hash to Videos
If videos are private, add the hash to the video data in `src/data/directors.ts`:

```typescript
{
  id: "video-id",
  title: "Video Title",
  client: "Client Name",
  vimeoId: "123456789",
  thumbnailId: "987654321",
  hash: "abc123def" // Add this for private videos
}
```

To get the hash from a Vimeo URL:
- Original URL: `https://vimeo.com/123456789/abc123def`
- Hash is the part after the slash: `abc123def`

## Debugging in Production

Look for these console messages:
- `[VimeoPlayer] Element vimeo_{id} found on retry {n}` - Element found
- `[VimeoPlayer] Initializing player for video {id}` - Player initialization started
- `[VimeoPlayer] Using URL with hash: {url}` - Using private video URL
- `[VimeoPlayer] Using video ID: {id}` - Using public video ID
- `[VimeoPlayer] Player ready for video {id}` - Player successfully loaded
- `[VimeoPlayer] Error with video {id}:` - Player error occurred

## Next Steps

1. **Deploy to production** and monitor console logs
2. **Check if videos are private** in Vimeo dashboard
3. **Add hashes** to video data if needed
4. **Monitor error rates** and user feedback
5. **Consider adding Sentry** or error tracking for production monitoring

## Additional Notes

- The loading error appears after 10 seconds if the player doesn't load
- Users can click "Retry" to reload the page
- All changes maintain backward compatibility with public videos
- No visual design changes were made (as per user preference)

