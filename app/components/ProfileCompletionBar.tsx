import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ProfileCompletionBarProps {
  completion: number;
}

const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({ completion }) => {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Profile Completion
      </Typography>
      <LinearProgress variant="determinate" value={completion} />
      <Typography variant="body2" color="text.secondary" align="right">
        {`${Math.round(completion)}%`}
      </Typography>
    </Box>
  );
};

export default ProfileCompletionBar;