import React, { useId } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';

export interface CommunityDialogProps {
  open: boolean;
  onClose?: () => void;
  title: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  actions?: React.ReactNode;
  // Allow an external modal, such as the Cloudinary uploader, to receive focus.
  disableEnforceFocus?: boolean;
}

export const CommunityDialog: React.FC<CommunityDialogProps> = ({
  open,
  onClose,
  title,
  maxWidth = 'sm',
  children,
  actions,
  disableEnforceFocus = false,
}) => {
  const titleId = useId();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      aria-labelledby={titleId}
      disableEnforceFocus={disableEnforceFocus}
    >
      <DialogTitle id={titleId} sx={{ pr: 8 }}>
        {title}
      </DialogTitle>
      {onClose && (
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 16 }}
        >
          <CloseRounded />
        </IconButton>
      )}
      <DialogContent>{children}</DialogContent>
      {actions}
    </Dialog>
  );
};
