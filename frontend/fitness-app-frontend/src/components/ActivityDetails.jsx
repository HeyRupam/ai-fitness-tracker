import React from 'react'
import { Box, Card, CardContent, Divider, Typography, Chip, Stack, Avatar, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useParams } from 'react-router';
import { getActivityDetails } from '../services/api';

function ActivityDetails() {

  const {id} = useParams();
  const [activity, setActivity] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Fetch activity details using the id
    const fetchActivityDetails = async () => {
      try {
        const response = await getActivityDetails(id);
        setActivity(response.data);
      } catch (err) {
        console.error("Error fetching activity details:", err);
        setError("No recommendation available yet. It is generated in the background — try again in a few seconds.");
      }
    };

    fetchActivityDetails();
  }, [id]);

  if(error) {
    return <Typography color="text.secondary">{error}</Typography>
  }

  if(!activity) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Paper sx={{ p: 2 }} elevation={2}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{activity.activityType ? activity.activityType.charAt(0) : 'A'}</Avatar>
        <Box>
          <Typography variant="h5">{activity.activityType}</Typography>
          <Typography variant="body2" color="text.secondary">{new Date(activity.createdAt).toLocaleString()}</Typography>
        </Box>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1">Details</Typography>
          <Typography>Duration: {activity.activityDuration ?? activity.duration} minutes</Typography>
          <Typography>Calories Burned: {activity.caloriesBurned}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recommendations</Typography>

          <Typography variant='subtitle2' sx={{ mt: 1 }}>Analysis</Typography>
          <Typography paragraph>{activity.recommendation}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle2'>Improvements</Typography>
          <List dense>
            {activity?.improvements?.map((imp, index) => (
              <ListItem key={index}>
                <ListItemText primary={imp} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle2'>Suggestions</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {activity?.suggestions?.map((sugg, index) => (
              <Chip key={index} label={sugg} sx={{ mb: 1 }} />
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle2'>Safety Guidelines</Typography>
          <List dense>
            {activity?.safety?.map((guideline, index) => (
              <ListItem key={index}><ListItemText primary={guideline} /></ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Paper>
  )
}

export default ActivityDetails