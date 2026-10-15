import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import {
  CommunityMapTheme,
  CommunityDialog,
} from '@opencommunitymap/react-sdk';
import { NewContentWidget } from '../../src/components/NewContentWidget';
import { PostCommentWidget } from '../../../react-sdk/dist/components/Comments';
import CloudinaryImageUpload from '../../../react-sdk/dist/components/CloudinaryImageUpload';

// Simulate the external uploader without making network requests or uploading files.
(window as any).cloudinary = {
  createUploadWidget: (
    _options: unknown,
    callback: (error: null, result: unknown) => void
  ) => ({
    open: () => {
      const overlay = document.createElement('div');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', 'Image upload');
      overlay.style.cssText =
        'position:fixed;inset:0;background:white;z-index:2000;padding:24px';
      const input = document.createElement('input');
      input.setAttribute('aria-label', 'Image URL');
      const done = document.createElement('button');
      done.textContent = 'Use image';
      done.onclick = () => {
        callback(null, { event: 'success', info: { secure_url: input.value } });
        overlay.remove();
      };
      overlay.append(input, done);
      document.body.append(overlay);
      input.focus();
    },
  }),
};

// Exercise the real forms without authenticating or writing to Firestore.
createRoot(document.getElementById('root')!).render(
  <CommunityMapTheme>
    <CssBaseline />
    {window.location.search === '?upload' && (
      <CommunityDialog open title="Add a place" disableEnforceFocus>
        <CloudinaryImageUpload
          cloudName="test"
          onChange={(url) => {
            document.getElementById('uploaded')!.textContent = url;
          }}
        />
      </CommunityDialog>
    )}
    <NewContentWidget
      authenticated
      onAdd={async (item) => {
        document.getElementById('posted')!.textContent = JSON.stringify(item);
      }}
    />
    <div style={{ position: 'absolute', top: 24, right: 24, width: 280 }}>
      <PostCommentWidget
        onComment={async (comment) => {
          if (comment === 'retry') throw new Error('Try again');
          document.getElementById('commented')!.textContent = comment;
        }}
      />
    </div>
    <output id="uploaded" hidden />
    <output id="posted" hidden />
    <output id="commented" hidden />
  </CommunityMapTheme>
);
