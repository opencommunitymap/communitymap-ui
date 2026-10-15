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
} from '@opencommunitymap/react-sdk';
import {
  CircularProgress,
  TextField,
  IconButton,
  InputAdornment,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Typography,
} from '@mui/material';
import SendRounded from '@mui/icons-material/SendRounded';
import { CommunityDialog } from '@opencommunitymap/react-sdk';
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
    <div className={`single-message ${isMe ? 'sent' : 'received'}`}>
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
  const { info, messages, postMessage, updateLastMessageReadByMe } =
    useDirectMessage(dmKey);
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
      content: <CircularProgress aria-label="Loading conversation" />,
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
          />
        ))}
        <div ref={refMessagesBottom} />
      </div>
    </div>
  ) : (
    <div>You need to login first.</div>
  );

  const action = me ? (
    <form
      className="message-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <TextField
        value={message}
        label="Your message"
        onChange={(e) => setMessage(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  color="primary"
                  aria-label="Send message"
                  disabled={!message.trim()}
                >
                  <SendRounded />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </form>
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
    <CommunityDialog
      open
      onClose={onClose}
      title={header || 'Messages'}
      actions={<DialogActions>{action}</DialogActions>}
    >
      {content}
    </CommunityDialog>
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
    <ListItem disablePadding divider className="direct-message-dialog">
      <ListItemButton
        component={Link}
        to={`/direct-messages/${directMessageId(me?.uid || '', peerId)}`}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: unread ? 'primary.main' : 'action.disabled' }}>
            {(peer?.name || '?')[0].toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={peer?.name || 'Anonymous'}
          secondary={dayjs(updated).fromNow()}
          slotProps={{ primary: { sx: { fontWeight: unread ? 700 : 400 } } }}
        />
        {unread && (
          <Typography variant="caption" color="primary">
            New
          </Typography>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export const DirectMessageDialogs: React.FC = () => {
  const me = useAuth();
  const { dialogs } = useMyDirectMessages();
  return (
    <List disablePadding>
      {dialogs?.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          No messages yet. Visit a neighbor’s profile to start a conversation.
        </Typography>
      )}
      {dialogs?.map((dlg) => (
        <DialogInfoItem info={dlg} me={me} key={dlg.id} />
      ))}
    </List>
  );
};
