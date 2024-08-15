import React, { useMemo } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface SkeletonLoaderProps {
  type: 'hero' | 'section';
}

interface SkeletonItemProps {
  width: string | number;
  height: string | number;
  mt?: number;
}

const useShimmer = () => {
  const shimmerStyle = useMemo(() => ({
    backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
  }), []);

  return shimmerStyle;
};

const SkeletonItem: React.FC<SkeletonItemProps> = React.memo(({ width, height, mt = 0 }) => {
  const shimmerStyle = useShimmer();

  return (
    <div
      style={{
        width,
        height,
        marginTop: mt,
        borderRadius: '4px',
        ...shimmerStyle,
      }}
    />
  );
});

SkeletonItem.displayName = 'SkeletonItem';

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  const boxStyles: SxProps<Theme> = { width: '100%', mb: 4 };

  return (
    <Box sx={boxStyles}>
      <div className="skeleton-container">
        {type === 'hero' ? (
          <>
            <SkeletonItem width="100%" height={60} />
            <SkeletonItem width="80%" height={40} mt={16} />
            <SkeletonItem width={200} height={50} mt={16} />
          </>
        ) : (
          <>
            <SkeletonItem width="60%" height={40} />
            <SkeletonItem width="80%" height={20} mt={8} />
            <SkeletonItem width="100%" height={200} mt={16} />
          </>
        )}
      </div>
    </Box>
  );
};

SkeletonLoader.displayName = 'SkeletonLoader';

export default React.memo(SkeletonLoader);