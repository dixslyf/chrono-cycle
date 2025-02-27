import React, { useEffect } from 'react';

const SaveNotificationMethods: React.FC = () => {
  useEffect(() => {
    const saveNotificationMethods = async () => {
      try {
        const response = await fetch('@/app/components/notification/notificationAPI', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to save notification methods');
        }

        const result = await response.json();
        console.log(result.message);
      } catch (error) {
        console.error('Error saving notification methods:', error);
      }
    };

    saveNotificationMethods();
  }, []);

  return null; 
};

export default SaveNotificationMethods;