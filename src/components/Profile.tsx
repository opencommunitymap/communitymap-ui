import React, { useState } from 'react';
import { Form, Loader, Message } from 'semantic-ui-react';
import { useUserPublicInfo, useAsyncStatus, saveUserPublicInfo } from '../DB';

export const EditUserProfile: React.FC<{ user: firebase.User }> = ({
  user,
}) => {
  const info = useUserPublicInfo(user.uid);
  const [changed, setChanged] = useState<{ name: string } | null>(null);

  const { status, func: saveInfo } = useAsyncStatus(async () => {
    return saveUserPublicInfo({
      ...(info || { id: user.uid }),
      ...(changed || { name: '' }),
    });
  });

  if (info === undefined) return <Loader active />;
  // if (info === null) return <div>User not found :(</div>;

  return (
    <Form
      onSubmit={() => saveInfo()}
      loading={status.pending}
      error={!!status.error}
      success={status.success}
    >
      <Form.Input
        label="Name/Nickname"
        required
        value={changed?.name || info?.name || ''}
        onChange={(e, { value }) => setChanged({ ...changed, name: value })}
      />
      {/* <Form.Input label="Gender"/> */}

      <Message error>{status.error}</Message>
      <Message success>Successfully saved</Message>

      <Form.Group>
        <Form.Button primary disabled={!changed}>
          Save
        </Form.Button>
        <Form.Button
          type="button"
          disabled={!changed}
          onClick={() => setChanged(null)}
        >
          Clear changes
        </Form.Button>
      </Form.Group>
    </Form>
  );
};
