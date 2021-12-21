import React, { useEffect, useRef } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  cropper: {
    width: '247px',
    height: '232px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '306px',
    },

    '& .cropper-line': {
      backgroundColor: ' #fff',
    },

    '& .cropper-view-box': {
      outline: '1px solid #fff',
      outlineColor: 'rgba(255, 255, 255, 0.75)',
    },

    '& .cropper-point': {
      width: '16px',
      height: '16px',
      border: '4px solid rgba(255, 255, 255, 1)',
      zIndex: -1,
      background: 'none',
    },
  },
}));

let timer: ReturnType<typeof setTimeout> = null;
const CroppeDemo = props => {
  const classes = useStyles();
  const imgRef = useRef(null);
  const myCropper = useRef(null);
  const { propSend, src, className, imgClassName } = props;

  const handleImgLoaded = () => {
    let latestSrc = null;
    const cropper = new Cropper(imgRef.current, {
      viewMode: 3,
      autoCropArea: 0.98,
      crop() {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          handleSend(latestSrc);
          latestSrc = src;
        }, 1000);
      },
    });
    myCropper.current = cropper;
  };

  // update cropper img
  useEffect(() => {
    if (src && myCropper.current) {
      myCropper.current.destroy();
      myCropper.current.crop();
    }
  }, [src]);

  const handleSend = (latestSrc: string) => {
    const cropperInstance = myCropper.current;
    if (latestSrc !== src) {
      return;
    }
    cropperInstance.getCroppedCanvas().toBlob(
      blob => {
        propSend(blob, true, null);
      } /*, 'image/png' */
    );
  };

  return (
    <div className={classes.cropper}>
      <div className={className}>
        {src && (
          <img
            ref={imgRef}
            src={src}
            alt="test"
            className={imgClassName}
            draggable={false}
            onLoad={handleImgLoaded}
          ></img>
        )}

        {/* <button onClick={handleDownload}>download</button>
      <button onClick={handleSend}>send</button> */}
      </div>
    </div>
  );
};
export default CroppeDemo;