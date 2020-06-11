import React, { useMemo, useRef } from 'react';
import { Icon } from 'semantic-ui-react';
import './CloudinaryImageUpload.css';

export interface UploadWidgetProps {
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
          onChangeCb.current(result.info.url);
        }
        if (error) console.error(error);
      }
    );
  }, [cloudName, uploadPreset]);

  return (
    <div className="cloudinary-upload-widget">
      {children}
      <div className="cloudinary-overlay-widget" onClick={() => widget.open()}>
        <Icon size="tiny" name="edit outline" />
      </div>
    </div>
  );
};
export default CloudinaryImageUpload;
