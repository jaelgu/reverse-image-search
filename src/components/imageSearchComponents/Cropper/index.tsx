import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useCheckIsMobile } from '../../../hooks/Style';

const useStyles = makeStyles((theme: Theme) => ({
  cropper: () => ({
    width: '247px',
    height: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&>img': {
      width: '100%',
      height: '100%',
    },

    [theme.breakpoints.down('sm')]: {
      width: '306px',
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
  }),
}));

let timer: ReturnType<typeof setTimeout> = null;

const CroppeDemo = props => {
  const { cropAndSearch, src, className, imgClassName, model = '' } = props;
  const classes = useStyles();
  const cropperRef = useRef<any>(null);
  const [cropData, setCropData] = useState({
    x: 0,
    y: 0,
    width: '100%',
    height: '100%',
  });

  let onCrop = () => {
    const imageElement: any = cropperRef?.current;

    const cropper: any = imageElement?.cropper;
    const model: any = imageElement?.model;

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      if (!cropper?.getCroppedCanvas()) {
        return;
      }
      cropper.getCroppedCanvas().toBlob(
        blob => {
          cropAndSearch(blob, model, true, null);
        } /*, 'image/png' */
      );
    }, 1000);
  };

  useEffect(() => {
    cropperRef.current.model = model;

    setCropData({
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
    });
  }, [model]);

  return (
    <div className={classes.cropper}>
      <Cropper
        src={src}
        style={{ height: 'auto', width: '100%' }}
        // Cropper.js options
        autoCropArea={1}
        autoCrop={true}
        data={cropData}
        guides={true}
        crop={onCrop}
        ref={cropperRef}
      />
    </div>
  );
};
export default CroppeDemo;
