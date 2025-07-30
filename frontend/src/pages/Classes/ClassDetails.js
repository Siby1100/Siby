import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Construction } from '@mui/icons-material';

const ClassDetails = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Construction sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Détails de la Classe
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cette page sera bientôt disponible. Elle permettra de consulter les détails d'une classe,
            gérer les étudiants, les groupes et les devoirs.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClassDetails;