import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Profile } from '../types/ProfileTypes';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

interface ProfileSectionProps {
  profile: Profile;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  const theme = useTheme();

  const profileItems = [
    { label: 'Brand', value: profile.brand },
    { label: 'Product', value: profile.product },
    { label: 'Goals', value: profile.goals },
    { label: 'KPIs', value: profile.kpis },
    { label: 'Budget', value: profile.budget },
  ];

  return (
    <Box>
      {profileItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
              {item.label}
            </Typography>
            {item.value ? (
              <Chip
                label={item.value}
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'medium',
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontStyle: 'italic' }}>
                Not provided
              </Typography>
            )}
          </Box>
        </motion.div>
      ))}
    </Box>
  );
};

export default ProfileSection;