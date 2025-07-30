import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import {
  SupervisorAccount,
  Person,
  Email,
  School,
  DateRange,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, isProfessor } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Mon Profil
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: 40,
                }}
              >
                {isProfessor ? <SupervisorAccount /> : <Person />}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Chip
                label={isProfessor ? 'Professeur' : 'Étudiant'}
                color={isProfessor ? 'primary' : 'secondary'}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Information Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Informations personnelles
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Rôle
                      </Typography>
                      <Typography variant="body1">
                        {isProfessor ? 'Professeur' : 'Étudiant'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <DateRange sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Membre depuis
                      </Typography>
                      <Typography variant="body1">
                        {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;