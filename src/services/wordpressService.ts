import { useAppContext } from '../context/AppContext';

interface PublishPostParams {
  title: string;
  content: string;
  imageUrl?: string;
}

export const useWordpressService = () => {
  const { wordpressConfig } = useAppContext();

  const publishPost = async (params: PublishPostParams): Promise<string> => {
    const { title, content, imageUrl } = params;
    const { siteUrl, username, appPassword } = wordpressConfig;

    if (!siteUrl || !username || !appPassword) {
      throw new Error('WordPress configuration is incomplete. Please check your settings.');
    }

    try {
      let featuredMediaId = null;

      // Upload image if provided
      if (imageUrl) {
        console.log('Starting image upload process...', { imageUrl });
        
        // First, fetch the image data
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          console.error('Failed to fetch image:', {
            status: imageResponse.status,
            statusText: imageResponse.statusText
          });
          throw new Error('Failed to fetch image');
        }
        
        console.log('Image fetched successfully');
        const imageBlob = await imageResponse.blob();
        console.log('Image blob created:', {
          size: imageBlob.size,
          type: imageBlob.type
        });
        
        const formData = new FormData();
        
        // Generate a filename from the title
        const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
        formData.append('file', imageBlob, filename);
        
        console.log('Uploading to WordPress:', {
          endpoint: `${siteUrl}/wp-json/wp/v2/media`,
          filename
        });

        // Upload to WordPress media library
        const mediaResponse = await fetch(`${siteUrl}/wp-json/wp/v2/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${username}:${appPassword}`)}`,
          },
          body: formData,
        });

        if (!mediaResponse.ok) {
          const mediaError = await mediaResponse.json();
          console.error('Media upload failed:', {
            status: mediaResponse.status,
            error: mediaError
          });
          throw new Error(mediaError.message || 'Failed to upload media');
        }

        const mediaData = await mediaResponse.json();
        console.log('Media upload successful:', {
          mediaId: mediaData.id,
          mediaUrl: mediaData.source_url
        });
        featuredMediaId = mediaData.id;
      }

      // Create the post
      const postData: any = {
        title,
        content,
        status: 'publish',
      };

      if (featuredMediaId) {
        postData.featured_media = featuredMediaId;
      }

      console.log('Creating WordPress post:', {
        endpoint: `${siteUrl}/wp-json/wp/v2/posts`,
        postData
      });

      const postResponse = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${username}:${appPassword}`)}`,
        },
        body: JSON.stringify(postData),
      });

      if (!postResponse.ok) {
        const postError = await postResponse.json();
        console.error('Post creation failed:', {
          status: postResponse.status,
          error: postError
        });
        throw new Error(postError.message || 'Failed to publish post');
      }

      const post = await postResponse.json();
      console.log('Post published successfully:', {
        postId: post.id,
        postUrl: post.link
      });
      
      return post.link; // Return the published post URL
    } catch (error) {
      console.error('Error in publishPost:', error);
      throw error;
    }
  };

  const validateCredentials = async (): Promise<boolean> => {
    const { siteUrl, username, appPassword } = wordpressConfig;

    if (!siteUrl || !username || !appPassword) {
      return false;
    }

    try {
      const response = await fetch(`${siteUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${appPassword}`)}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating WordPress credentials:', error);
      return false;
    }
  };

  return {
    publishPost,
    validateCredentials,
  };
};