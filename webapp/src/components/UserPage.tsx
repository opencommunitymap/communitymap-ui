import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useUserPublicInfo,
  useAuth,
  directMessageId,
} from 'react-communitymap';
import { Loader, Button } from 'semantic-ui-react';

export const UserPage = () => {
  const me = useAuth();
  const { userId } = useParams();

  const userInfo = useUserPublicInfo(userId || '', true);
  if (userInfo === undefined) return <Loader active />;

  return (
    <div style={{ lineHeight: '2em' }}>
      {userInfo === null ? (
        <div>The user has't filled his/her details yet</div>
      ) : (
        <>
          <h3>Name/Nickname: {userInfo?.name}</h3>
          <div>Registered on {userInfo.created}</div>
          <div>Last updated on {userInfo.updated}</div>
        </>
      )}
      <div style={{ marginTop: 30 }}>
        {!!me && !!userId && me.uid !== userId && (
          <Button
            basic
            color="blue"
            icon="send"
            content="Direct message"
            as={Link}
            to={`/direct-messages/${directMessageId(me.uid, userId)}`}
          />
        )}
      </div>
    </div>
  );
};
