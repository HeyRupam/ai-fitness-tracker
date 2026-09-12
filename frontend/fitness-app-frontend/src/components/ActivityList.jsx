import React from "react";
import { Card, CardActionArea, CardContent, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router";
import { getActivities } from "../services/api";

const ActivityList = () => {

    const [activities, setActivities] = React.useState([]);
    const navigate = useNavigate();

    const fetchActivities = async () => {
        try {
            const response = await getActivities();
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    React.useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <Grid container spacing={2}>
            {activities.map((activity) => (
                <Grid size={{ xs: 12, sm: 6 }} key={activity.id}>
                    <Card elevation={2}>
                        <CardActionArea onClick={() => navigate(`/activities/${activity.id}`)}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {activity.type}
                                </Typography>
                                <Typography variant="h6">{activity.duration} minutes</Typography>
                                {activity.caloriesBurned !== undefined && (
                                    <Typography variant="body2" color="text.secondary">{activity.caloriesBurned} kcal</Typography>
                                )}
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    )
}

export default ActivityList;