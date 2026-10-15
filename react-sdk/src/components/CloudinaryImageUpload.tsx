import React, { useMemo, useRef } from 'react';
import { IconButton } from '@mui/material';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import './CloudinaryImageUpload.css';

export interface UploadWidgetProps {
  children?: React.ReactNode;
  cloudName: string;
  uploadPreset?: string;
  onChange: (value: string) => void;
}

const CloudinaryImageUpload: React.FC<UploadWidgetProps> = ({
  cloudName,
  uploadPreset,
  onChange,
  children,
}) => {
  const onChangeCb = useRef(onChange);
  onChangeCb.current = onChange;

  const widget = useMemo(() => {
    return (window as any).cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
      },
      (error: Error, result: any) => {
        if (!error && result && result.event === 'success') {
          console.debug('Done! Here is the image info: ', result.info);
          onChangeCb.current(result.info.secure_url);
        }
        if (error) console.error(error);
      }
    );
  }, [cloudName, uploadPreset]);

  return (
    <div className="cloudinary-upload-widget">
      {children}
      <IconButton
        aria-label="Upload logo"
        className="cloudinary-overlay-widget"
        onClick={() => widget.open()}
      >
        <AddPhotoAlternateOutlined />
      </IconButton>
    </div>
  );
};
export default CloudinaryImageUpload;
