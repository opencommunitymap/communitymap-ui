import React from 'react';
import { useParams } from 'react-router-dom';
import { useUserPublicInfo } from '../DB';
import { Loader } from 'semantic-ui-react';

export const UserPage = () => {
  const { userId } = useParams();

  const userInfo = useUserPublicInfo(userId || '');
  if (userInfo === undefined) return <Loader active />;
  if (userInfo === null)
    return <div>The user has't filled his/her details yet</div>;

  return (
    <div style={{ lineHeight: '2em' }}>
      <h3>Name/Nickname: {userInfo?.name}</h3>
      <div>Registered on {userInfo.created}</div>
      <div>Last updated on {userInfo.updated}</div>
    </div>
  );
};
