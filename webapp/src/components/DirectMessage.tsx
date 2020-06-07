import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useDirectMessage,
  useUserPublicInfo,
  useMyDirectMessages,
  useAuth,
  DirectMessageItem,
  UserProfile,
  DirectMessageInfo,
  AuthUser,
  reportError,
  directMessageId,
} from 'react-communitymap';
import { Loader, Form, Button, Modal, List } from 'semantic-ui-react';
import './DirectMessage.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const SingleMessage: React.FC<{
  msg: DirectMessageItem;
  isMe: boolean;
  peerProfile: UserProfile | null | undefined;
}> = ({ msg, isMe, peerProfile }) => {
  const { timestamp, content } = msg;
  return (
    <div className="single-message">
      <span>
        <strong>{isMe ? 'Me' : peerProfile?.name}</strong>
        <span className="timestamp" title={timestamp}>
          {dayjs(timestamp).fromNow()}
        </span>
      </span>
      <div>{content}</div>
    </div>
  );
};

const useDirectMessageView = () => {
  const { dmKey = '' } = useParams<{ dmKey: string }>();
  const {
    info,
    messages,
    postMessage,
    updateLastMessageReadByMe,
  } = useDirectMessage(dmKey);
  console.debug('DirectMessage', dmKey, { info, messages });
  const me = useAuth();
  const ids = dmKey.split('-');

  const peerId = ids[0] === me?.uid ? ids[1] : ids[0];
  const peerInfo = useUserPublicInfo(peerId);

  const refMessagesBottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    refMessagesBottom.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    // basically marking conversation till current last message as read
    // TODO make it smarter by actually tracing the last message seen on screen
    if (info && me && info.lastMsgId !== info.lastReadBy[me.uid]) {
      updateLastMessageReadByMe().catch((err) => reportError(err, true));
    }
  }, [info, me, updateLastMessageReadByMe]);

  const [message, setMessage] = useState('');

  const onSubmit = () => {
    if (message) {
      setMessage('');
      postMessage(message).catch((err) => {
        console.log('Error posting direct message:', err);
        alert('Unfortunately this message was not sent: ' + message);
      });
    }
  };

  if (peerInfo === undefined)
    return {
      header: '',
      content: <Loader active />,
      action: <span />,
    };

  const peerName = peerInfo?.name || `User ${peerId}`;
  const header = peerName;

  const content = me ? (
    <div className="direct-message">
      {!info && `This is the beginning of your conversation with ${peerName}`}
      <div className="messages">
        {messages.map((msg) => (
          <SingleMessage
            msg={msg}
            peerProfile={peerInfo}
            isMe={msg.author === me.uid}
            key={msg.id}
          >
            {JSON.stringify(msg)}
          </SingleMessage>
        ))}
        <div ref={refMessagesBottom} />
      </div>
    </div>
  ) : (
    <div>You need to login first.</div>
  );

  const action = me ? (
    <Form onSubmit={onSubmit}>
      <Form.Input
        value={message}
        placeholder="Your message here"
        action={<Button icon="send" />}
        onChange={(e, { value }) => setMessage(value as string)}
      />
    </Form>
  ) : (
    <span />
  );

  return { header, content, action };
};

export const DirectMessageModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { header, content, action } = useDirectMessageView();
  return (
    <Modal
      open
      closeIcon
      size="tiny"
      className="modal-direct-message"
      onClose={onClose}
    >
      <Modal.Header>{header}</Modal.Header>
      <Modal.Content scrolling>{content}</Modal.Content>
      <Modal.Actions>{action}</Modal.Actions>
    </Modal>
  );
};

const DialogInfoItem: React.FC<{ info: DirectMessageInfo; me: AuthUser }> = ({
  info,
  me,
}) => {
  const { updated, members, lastMsgId, lastReadBy } = info;
  const peerId = members[0] === me?.uid ? members[1] : members[0];
  const peer = useUserPublicInfo(peerId);
  const unread = lastMsgId !== lastReadBy?.[me?.uid || ''];
  return (
    <List.Item className="direct-message-dialog">
      <List.Content>
        <List.Header>
          <Link
            to={`/direct-messages/${directMessageId(
              me?.uid || '',
              peer?.id || ''
            )}`}
            className={unread ? 'unread' : 'read'}
          >
            {peer?.name || 'Anonymous'}
          </Link>
        </List.Header>
        {dayjs(updated).fromNow()}
      </List.Content>
    </List.Item>
  );
};

export const DirectMessageDialogs: React.FC = () => {
  const me = useAuth();
  const { dialogs } = useMyDirectMessages();
  return (
    <List divided size="big">
      {dialogs?.map((dlg) => (
        <DialogInfoItem info={dlg} me={me} key={dlg.id} />
      ))}
    </List>
  );
};
