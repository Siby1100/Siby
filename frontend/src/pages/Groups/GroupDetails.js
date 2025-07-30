import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Construction } from '@mui/icons-material';

const GroupDetails = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Construction sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Détails du Groupe
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cette page sera bientôt disponible. Elle permettra de consulter les détails d'un groupe,
            gérer les membres, voir les soumissions et suivre la progression du projet.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GroupDetails;