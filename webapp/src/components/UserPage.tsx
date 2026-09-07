import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useUserPublicInfo,
  useAuth,
  directMessageId,
} from '@opencommunitymap/react-sdk';
import {
  CircularProgress,
  Button,
  Avatar,
  Stack,
  Typography,
} from '@mui/material';
import SendRounded from '@mui/icons-material/SendRounded';

export const UserPage: React.FC = () => {
  const me = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const userInfo = useUserPublicInfo(userId || '', true);
  if (userInfo === undefined)
    return <CircularProgress aria-label="Loading profile" />;
  return (
    <Stack
      spacing={2}
      sx={{ alignItems: 'center', py: 2, textAlign: 'center' }}
    >
      <Avatar
        sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 30 }}
      >
        {(userInfo?.name || '?')[0].toUpperCase()}
      </Avatar>
      <Typography variant="h5">
        {userInfo?.name || 'Community member'}
      </Typography>
      {userInfo === null ? (
        <Typography color="text.secondary">
          This member hasn't added their details yet.
        </Typography>
      ) : (
        <>
          {userInfo.created && (
            <Typography variant="body2" color="text.secondary">
              Joined {new Date(userInfo.created).toLocaleDateString()}
            </Typography>
          )}
          {userInfo.updated && (
            <Typography variant="caption" color="text.secondary">
              Updated {new Date(userInfo.updated).toLocaleDateString()}
            </Typography>
          )}
        </>
      )}
      {me && userId && me.uid !== userId && (
        <Button
          variant="contained"
          startIcon={<SendRounded />}
          component={Link}
          to={`/direct-messages/${directMessageId(me.uid, userId)}`}
        >
          Direct message
        </Button>
      )}
    </Stack>
  );
};
