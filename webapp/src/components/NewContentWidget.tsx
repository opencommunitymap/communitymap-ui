import React, { useState } from 'react';
import { Button, Segment, Modal } from 'semantic-ui-react';
import {
  ObjectItemInput,
  reportError,
  AddNewPlaceObject,
  AddNewStoryObject,
  AddNewChatObject,
  type2icon,
  type2title,
  Login,
} from 'react-communitymap';
import 'firebase/auth';
import './NewContentWidget.css';

const AddNewObjectRender: React.FC<{
  type: ObjectItemInput['type'];
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ type, onAdd }) => {
  switch (type) {
    case 'place':
      return <AddNewPlaceObject type={type} onPost={onAdd} />;
    case 'story':
      return <AddNewStoryObject type={type} onPost={onAdd} />;
    case 'chat':
    case 'request':
    case 'offer':
    default:
      return <AddNewChatObject type={type} onPost={onAdd} />;
  }
};

export const NewContentWidget: React.FC<{
  authenticated: boolean;
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ authenticated, onAdd }) => {
  const [addType, setAddType] = useState<ObjectItemInput['type'] | null>(null);

  const showLogin = !authenticated && !!addType;

  return (
    <Segment id="new-content-widget">
      {showLogin && <Login />}
      {authenticated && (
        <>
          {!!addType && (
            <Modal open size="tiny" closeIcon onClose={() => setAddType(null)}>
              <Modal.Content>
                <AddNewObjectRender
                  type={addType}
                  onAdd={(it) =>
                    onAdd(it)
                      .then(() => setAddType(null))
                      .catch(reportError)
                  }
                />
              </Modal.Content>
            </Modal>
          )}
        </>
      )}
      <h5>I want to post</h5>
      {([
        'chat',
        'request',
        'offer',
        // 'donation',
      ] as ObjectItemInput['type'][]).map((type) => (
        <Button
          key={type}
          icon={type2icon(type)}
          // basic
          primary
          content={type2title(type)}
          onClick={() => setAddType(type)}
        />
      ))}
      <hr />
      <Button
        key="place"
        icon="building"
        primary
        content="Place"
        onClick={() => setAddType('place')}
      />
      <hr />
      <Button
        key="story"
        icon="edit outline"
        primary
        content="Story"
        onClick={() => setAddType('story')}
      />
    </Segment>
  );
};
