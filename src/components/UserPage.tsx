import React from 'react';
import { useParams } from 'react-router-dom';

export const UserPage = () => {
  const { userId } = useParams();

  return (
    <div>
      <h3>User id {userId}</h3>
      TODO
    </div>
  );
};
