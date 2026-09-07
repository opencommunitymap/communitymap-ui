import React, { useState, useMemo } from 'react';
import { ObjectItemInput, ObjectItemComponentProps } from '..';
import { Button, TextField, Stack } from '@mui/material';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { CommentsList, PostCommentWidget } from './Comments';
import './Place.css';
import './commonStyles.css';
import cx from 'classnames';
import CloudinaryImageUpload from './CloudinaryImageUpload';
import { LikeWidget } from './LikeWidget';

const {
  REACT_APP_CLOUDINARY_CLOUD_NAME,
  REACT_APP_CLOUDINARY_UPLOAD_PRESET_LOGO,
} = process.env;

const reHttp = /^https?:\/\//;
// www.dd.com -> https://www.dd.com
const normalizeUrl = (url: string) =>
  reHttp.test(url) ? url : `https://${url}`;

export const Place: React.FC<ObjectItemComponentProps> = ({
  item,
  user,
  expanded,
  onClick,
  onVote,
  onComment,
}) => {
  const {
    title,
    description,
    logoURL,
    short_description,
    url,
    userVoted,
    votesCount: votes,
    comments,
  } = item;

  const commentsCount = comments?.length || 0;

  const sortedComments = useMemo(() => {
    if (!comments) return comments;
    return comments.sort((l, r) => (l.created < r.created ? -1 : 1));
  }, [comments]);

  return (
    <div
      className={cx({ item: true, 'place-item': true, expanded })}
      onClick={onClick}
    >
      <div className="title">
        {logoURL ? <img src={logoURL} alt="" /> : <StorefrontRounded />}
        {title}
      </div>

      {!!short_description && (
        <section className="short-description">{short_description}</section>
      )}
      {expanded && !!url && (
        <p className="external-url">
          <a href={normalizeUrl(url)} title={url}>
            <OpenInNewRounded fontSize="small" /> {url}
          </a>
        </p>
      )}
      {expanded && description !== title && (
        <section className="description">{description}</section>
      )}
      {!!commentsCount && (
        <div className="replies-count">{commentsCount} comments</div>
      )}
      {expanded && (
        <section>
          <LikeWidget votes={votes} userVoted={userVoted} onVote={onVote} />
        </section>
      )}
      {expanded && !!commentsCount && (
        <section>
          <h4 className="pale-heading">Replies</h4>
          <CommentsList comments={sortedComments!} />
        </section>
      )}
      {expanded &&
        (!!user ? (
          <PostCommentWidget onComment={onComment} />
        ) : (
          <div style={{ textAlign: 'center' }}>
            You need to register or sign in to be able to post
          </div>
        ))}
    </div>
  );
};

export const AddNewPlaceObject: React.FC<{
  type: ObjectItemInput['type'];
  onPost: (data: ObjectItemInput) => void;
}> = ({ type, onPost }) => {
  const [state, setState] = useState({} as any);
  const onChange = (e: any) => {
    const { name, value } = e.target;
    console.debug(e.target.name, e.target.value);
    setState({ ...state, [name]: value });
  };
  return (
    <div className="add-new-place">
      <h4>
        <StorefrontRounded /> New place
      </h4>
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(e) => {
          e.preventDefault();
          console.debug('submit', state);
          const {
            placeName,
            description,
            short_description = null,
            url = null,
            logoURL = null,
          } = state;

          onPost({
            type,
            title: placeName,
            description,
            short_description,
            url,
            logoURL,
            valid_until: '2100-01-05T09:00:00.000Z',
          });
        }}
      >
        {REACT_APP_CLOUDINARY_CLOUD_NAME && (
          <div>
            <label>Logo</label>
            <CloudinaryImageUpload
              cloudName={REACT_APP_CLOUDINARY_CLOUD_NAME}
              uploadPreset={REACT_APP_CLOUDINARY_UPLOAD_PRESET_LOGO}
              onChange={(logoURL) => setState({ ...state, logoURL })}
            >
              {state.logoURL && <img src={state.logoURL} alt="Place logo" />}
            </CloudinaryImageUpload>
          </div>
        )}
        <TextField
          autoComplete="off"
          label="Name"
          placeholder="e.g. Annie's Bakery"
          name="placeName"
          required
          onChange={onChange}
        />
        <TextField
          autoComplete="off"
          label="Very brief description"
          name="short_description"
          placeholder="e.g. Nice bagels and tasty latte"
          required
          onChange={onChange}
        />
        <TextField
          autoComplete="off"
          label="Website URL"
          name="url"
          onChange={onChange}
        />
        <TextField
          multiline
          minRows={4}
          autoFocus
          required
          label="Description"
          name="description"
          onChange={onChange}
        />

        <Button type="submit" variant="contained">
          Add
        </Button>
      </Stack>
    </div>
  );
};
