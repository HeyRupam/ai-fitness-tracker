import React from 'react'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Paper, Grid, Typography } from '@mui/material';
import { addActivity } from '../services/api';

function ActivityForm({ onActivitiesAdded }) {
    const [activity, setActivity] = React.useState({ type: 'RUNNING', duration: '', caloriesBurned: '', additionalMetrics: {} });

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log("Submitting activity:", activity);
            await addActivity(activity);
            // call parent callback if provided
            if (typeof onActivitiesAdded === 'function') onActivitiesAdded();
            setActivity({ type: 'RUNNING', duration: '', caloriesBurned: '', additionalMetrics: {} });
            window.location.reload();
        }
        catch (error) {
            console.error("Error adding activity:", error);
        }
    }

    return (
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 3 }} elevation={2}>
            <Grid container spacing={2} alignItems="center">
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Activity Type</InputLabel>
                <Select
                    value={activity.type}
                    onChange={(e) => setActivity({ ...activity, type: e.target.value })}
                >
                    <MenuItem value="RUNNING">Running</MenuItem>
                    <MenuItem value="CYCLING">Cycling</MenuItem>
                    <MenuItem value="SWIMMING">Swimming</MenuItem>
                    <MenuItem value="WEIGHT_TRAINING">Weight Training</MenuItem>
                    <MenuItem value="YOGA">Yoga</MenuItem>
                    <MenuItem value="CARDIO">Cardio</MenuItem>
                    <MenuItem value="HIT">HIT</MenuItem>
                    <MenuItem value="STRETCHING">Stretching</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                </Select>
            </FormControl>
            <TextField fullWidth label="Duration (minutes)" type="number" sx={{ mb: 2 }} value={activity.duration} onChange={(e) => setActivity({ ...activity, duration: e.target.value })} />
            <TextField fullWidth label="Calories Burned" type="number" sx={{ mb: 2 }} value={activity.caloriesBurned} onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })} />
            <Button variant="contained" color="primary" type="submit">Add Activity</Button>
            </Grid>
        </Paper>
    )
}



export default ActivityForm