import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { CircularProgress, Link, Typography } from '@material-ui/core';
import { rootContext } from '../../context/Root';
import {
  convertBase64UrlToBlob,
  getBase64Image,
  formatCount,
  formatImgData,
  getImgUrl,
  dataURLtoFile,
} from '../../utils/helper';
import Masonry from '../../components/imageSearchComponents/Masonry';
import { search, getCount } from '../../utils/http';
import UploaderHeader from '../../components/imageSearchComponents/Uploader';
import { useCheckIsMobile } from '../../hooks/Style';
import { useRouter } from 'next/router';
import Head from 'next/head';
// import { imageSearchDemo } from '../../../seo/page-description';
import 'gestalt/dist/gestalt.css';
import { DeviceType } from '../../types';
import { useStyles } from './style';

const Home = () => {
  formatCount(134200);
  const classes = useStyles();
  const { setDialog, dialog } = useContext(rootContext);
  const [imgs, setImgs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [partialLoading, setPartialLoading] = useState(false);
  const [selected, setSelected] = useState({
    src: '',
    isSelected: false,
  });
  const [count, setCount] = useState('');
  const [duration, setDuration] = useState<number | string>(0);
  const [file, setFile] = useState<any>(null!);
  const [isShowCode, setIsShowCode] = useState(false);
  const [noData, setNoData] = useState(false);
  const { open } = dialog;
  const scrollContainer = useRef(null);
  const isMobile = useCheckIsMobile();
  const [isNeedLoadMore, setIsNeedLoadMore] = useState(false);

  const handleSelectedImg = (file: File | Blob) => {
    setFile(file);
    const src = getImgUrl(file);
    setSelected({
      src,
      isSelected: true,
    });
  };

  const handleImgSearch = async <
    T extends {
      file: File | Blob;
      reset: boolean;
      scrollPage: number | null;
      isSelected: boolean;
    }
  >({
    file,
    reset,
    scrollPage,
    isSelected,
  }: any) => {
    setLoading(true);
    setDuration('searching...');
    let tempPage = page;
    if (reset) {
      setImgs([]);
      setPage(1);
      tempPage = 1;
      setNoData(false);
    }
    if (isSelected) {
      handleSelectedImg(file);
    }
    const fd = new FormData();
    fd.append('image', file);
    const params = {
      table_name: 'resnet101',
      device: `${isMobile ? 'mobile' : 'pc'}` as DeviceType,
      page: scrollPage || tempPage,
      num: window.innerWidth < 800 ? 16 : 50,
    };

    try {
      const [duration = 0, res] = await search(fd, params);
      setDuration(Number.prototype.toFixed.call(duration, 4));
      if (!res.length) {
        setNoData(true);
        return;
      }

      formatImgData(res, setImgs);
    } catch (error) {
      console.log(error);
    } finally {
      setPage(v => v + 1);
      setLoading(false);
    }
  };

  const handleImgToBlob = (src: string, reset = false) => {
    const image = document.createElement('img');
    image.crossOrigin = '';
    image.src = src;
    image.onload = async () => {
      const base64 = getBase64Image(image);
      const imgBlob = convertBase64UrlToBlob(base64);

      const file = new File([base64.dataURL], 'blob', {
        type: 'image/jpeg',
      });

      console.log('copyfile----', file);

      handleImgSearch({
        file: base64.dataURL,
        reset,
        scrollPage: null,
        isSelected: false,
      });
      setFile(imgBlob);
    };
  };

  // reduce unnecessary rerendering
  const loadItems = useCallback(
    async () => {
      try {
        setPartialLoading(true);
        await handleImgSearch({
          file,
          reset: false,
          scrollPage: page,
          isSelected: false,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setPartialLoading(false);
      }
    },
    // eslint-disable-next-line
    [file, page]
  );

  const toggleIsShowCode = () => {
    setIsShowCode(v => !v);
    window.dispatchEvent(new Event('resize'));
  };

  // reduce unnecessary rerendering
  const handleSearch = useCallback(
    src => {
      console.log(src);
      handleImgToBlob(src, true);
      setSelected({
        src: src,
        isSelected: true,
      });
    },
    // eslint-disable-next-line
    []
  );

  const getImgsCount = async () => {
    const count = await getCount('resnet101');
    setCount(formatCount(count));
  };

  useEffect(() => {
    handleImgToBlob('/images/demo.jpg');
    getImgsCount();
  }, []);

  return (
    <section className={classes.root} ref={scrollContainer}>
      <Head>
        <title>
          Milvus Reverse Image Search - Open-Source Vector Similarity
          Application Demo
        </title>
        {/* <meta name="description" content={imageSearchDemo} /> */}
      </Head>
      <div className={classes.container}>
        <div
          className={`${classes.contentContainer} ${
            isShowCode ? 'shrink' : ''
          }`}
        >
          <div className="top-part">
            <Link
              href="/milvus-demos"
              className={classes.backLink}
              underline="none"
              children={
                <>
                  <ChevronLeftIcon />
                  <Typography
                    variant="h4"
                    className="back-btn"
                    component="span"
                  >
                    Back to Demo
                  </Typography>
                </>
              }
            />
            <UploaderHeader
              searchImg={handleImgSearch}
              handleSelectedImg={handleSelectedImg}
              toggleIsShowCode={toggleIsShowCode}
              selectedImg={selected.src}
              count={count}
              duration={duration}
            />
          </div>

          {noData ? (
            <div className="no-data">
              <p style={{ textAlign: 'center' }}>No More Data.</p>
            </div>
          ) : (
            <Masonry
              pins={imgs}
              loadItems={loadItems}
              loading={partialLoading}
              isSelected={selected.isSelected}
              isShowCode={isShowCode}
              handleSearch={handleSearch}
              container={scrollContainer}
            />
          )}
        </div>

        {isShowCode ? <div className={classes.codeContainer}>123</div> : null}
      </div>
      {loading && !partialLoading ? (
        <div className={classes.loadingWrapper}>
          <CircularProgress />
        </div>
      ) : null}
    </section>
  );
};

export default Home;
