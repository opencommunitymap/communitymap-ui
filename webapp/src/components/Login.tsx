import React from 'react';
import { Login as SdkLogin } from '@opencommunitymap/react-sdk';

export const Login: React.FC<{ title?: string; onClose?: () => void }> = (
  props
) => (
  <SdkLogin
    {...props}
    policies={{
      termsOfServiceUrl: window.location.origin + '/terms',
      privacyPolicyUrl: window.location.origin + '/privacy',
    }}
  />
);
