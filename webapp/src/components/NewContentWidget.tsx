import React, { useState } from 'react';
import {
  Button,
  Paper,
  Typography,
  Box,
  Collapse,
  IconButton,
} from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import EditNoteRounded from '@mui/icons-material/EditNoteRounded';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import {
  ObjectItemInput,
  reportError,
  AddNewPlaceObject,
  AddNewStoryObject,
  AddNewChatObject,
  CommunityDialog,
  type2icon,
  type2title,
} from '@opencommunitymap/react-sdk';
import './NewContentWidget.css';
import { Login } from './Login';

const AddNewObjectRender: React.FC<{
  type: ObjectItemInput['type'];
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ type, onAdd }) => {
  switch (type) {
    case 'place':
      return <AddNewPlaceObject type={type} onPost={onAdd} />;
    case 'story':
      return <AddNewStoryObject type={type} onPost={onAdd} />;
    default:
      return <AddNewChatObject type={type} onPost={onAdd} />;
  }
};

const postTypes = [
  {
    type: 'chat',
    label: 'Start a chat',
    description: 'Say hello to your neighbors',
    Icon: type2icon('chat'),
  },
  {
    type: 'request',
    label: 'Ask for help',
    description: 'A little support goes a long way',
    Icon: type2icon('request'),
  },
  {
    type: 'offer',
    label: 'Offer help',
    description: 'Share your time or skills',
    Icon: type2icon('offer'),
  },
  {
    type: 'place',
    label: 'Add a place',
    description: 'Put a local favorite on the map',
    Icon: StorefrontRounded,
  },
  {
    type: 'story',
    label: 'Share a story',
    description: 'Every neighborhood has a story',
    Icon: EditNoteRounded,
  },
] as const;

export const NewContentWidget: React.FC<{
  authenticated: boolean;
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ authenticated, onAdd }) => {
  const [addType, setAddType] = useState<ObjectItemInput['type'] | null>(null);
  const [expanded, setExpanded] = useState(false);
  return (
    <Paper
      className={expanded ? 'is-expanded' : undefined}
      id="new-content-widget"
      component="aside"
      aria-label="Share with your community"
    >
      {!authenticated && !!addType && (
        <Login onClose={() => setAddType(null)} />
      )}
      {authenticated && !!addType && (
        <CommunityDialog
          open
          onClose={() => setAddType(null)}
          disableEnforceFocus={addType === 'place'}
          title={
            addType === 'place'
              ? 'Add a place'
              : addType === 'story'
                ? 'Share a story'
                : type2title(addType)
          }
        >
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your post will appear at the pin on the map.
          </Typography>
          <AddNewObjectRender
            type={addType}
            onAdd={(item) =>
              onAdd(item)
                .then(() => {
                  setAddType(null);
                  setExpanded(false);
                })
                .catch(reportError)
            }
          />
        </CommunityDialog>
      )}
      <Box className="post-panel-heading">
        <Box>
          <Typography
            variant="overline"
            color="primary"
            sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
          >
            Made for neighbors
          </Typography>
          <Typography variant="h5">Good things start nearby.</Typography>
        </Box>
        <IconButton
          className="mobile-panel-close"
          aria-label="Collapse posting options"
          onClick={() => setExpanded(false)}
        >
          <CloseRounded />
        </IconButton>
      </Box>
      <Typography
        className="post-panel-intro"
        variant="body2"
        color="text.secondary"
      >
        Connect, lend a hand, and discover what makes your community special.
      </Typography>
      <Button
        className="mobile-post-toggle"
        variant="contained"
        startIcon={<AddRounded />}
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="posting-options"
      >
        Share something nearby
      </Button>
      <Collapse in={expanded} className="post-options-collapse">
        <Box id="posting-options" className="post-options">
          {postTypes.map(({ type, label, description, Icon }) => (
            <Button
              key={type}
              className={`post-option post-option-${type}`}
              onClick={() => setAddType(type)}
            >
              <span className="post-option-icon">
                <Icon />
              </span>
              <span>
                <span className="post-option-label">{label}</span>
                <span className="post-option-description">{description}</span>
              </span>
              <AddRounded className="post-option-add" fontSize="small" />
            </Button>
          ))}
        </Box>
      </Collapse>
      <Typography
        className="post-panel-hint"
        variant="caption"
        color="text.secondary"
      >
        <PlaceOutlined fontSize="small" /> Move the map to choose your spot
      </Typography>
    </Paper>
  );
};
