import React, { useState } from 'react';
import { Form, Loader, Message, Card, Icon, Image, Grid, Button } from 'semantic-ui-react';
import { useUserPublicInfo, useAsyncStatus, saveUserPublicInfo } from '../DB';

export const EditUserProfile: React.FC<{ user: firebase.User }> = ({
  user,
}) => {
  const [toggled, setToggle] = useState(false);
  const info = useUserPublicInfo(user.uid, true);
  const [changed, setChanged] = useState<{ name: string } | null>(null);

  const { status, func: saveInfo } = useAsyncStatus(async () => {
    return saveUserPublicInfo({
      ...(info || { id: user.uid }),
      ...(changed || { name: '' }),
    });
  });

  if (info === undefined) return <Loader active />;
  // if (info === null) return <div>User not found :(</div>;
  const UserForm = () => (
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
  )
  const BtnSettings = () => <Button circular icon='settings' onClick={() => setToggle(toggled => !toggled )}/>
  
  return (
    <Card>
    <Image src='http://dwinery.com/ocm/wp-content/uploads/elementor/thumbs/avatar-ookvknm0adkt2o1cwyctxzbsfccgeo4fo00qr8xhao.png' wrapped ui={false} />
    <Card.Content>
  <Card.Header>
    <Grid>
      <Grid.Column floated='left' width={8}>
        {info?.name}
      </Grid.Column>
      <Grid.Column floated='right' width={3}>
      {BtnSettings()}
      </Grid.Column>
    </Grid>
  </Card.Header>
      <Card.Meta>
  <span className='date'>Joined in: {info?.created}</span>
      </Card.Meta>
      <Card.Description>
      {toggled && <>{UserForm()}</>}
      </Card.Description> 
    </Card.Content>
    <Card.Content extra>
    <Grid columns={2} divided>
      <Grid.Row>
        <Grid.Column>
          <Icon name='handshake' /> 11 People
        </Grid.Column>
        <Grid.Column>
          <Icon name='globe' /> 12 Places
        </Grid.Column>
      </Grid.Row>
    </Grid>
    </Card.Content>
  </Card>
  );
};