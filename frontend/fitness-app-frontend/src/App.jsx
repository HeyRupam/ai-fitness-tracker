import { Box, Button, AppBar, Toolbar, Typography, Container } from "@mui/material"
import { useContext, useLayoutEffect } from "react"
import { AuthContext } from "react-oauth2-code-pkce"
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router"
import { logout, setCredentials } from "./store/authSlice";
import { useDispatch } from "react-redux";
import ActivityList from "./components/ActivityList";
import ActivityForm from "./components/ActivityForm";
import ActivityDetails from "./components/ActivityDetails";

function App() {
  const {token, tokenData, logIn, logOut} = useContext(AuthContext);
  const dispatch = useDispatch();

  // useLayoutEffect (not useEffect) so the token is stored before child components'
  // useEffect API calls run — React runs child effects before parent effects.
  useLayoutEffect(() => {
    if(token){
      dispatch(setCredentials({token, user: tokenData}));
    }
  }, [token, tokenData, dispatch])

  return (
    <Router>
      {!token ? (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Button variant="contained" color="primary" onClick={() => logIn()}>Login</Button>
        </Container>
       ) : (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Fitness App
              </Typography>
              <Button color="inherit" onClick={() => { dispatch(logout()); logOut(); }}>Logout</Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="md" sx={{ py: 3 }}>
            <Routes>
              <Route path="/activities" element={<ActivitiesPage/>} />
              <Route path="/activities/:id" element={<ActivityDetails/>} />
              <Route path="/" element={token ? <Navigate to={'/activities'} replace/> : <div>Please log in</div>} />
            </Routes>
          </Container>
        </Box>
      )}
    </Router>
  )
}


const ActivitiesPage = () => {
  return (
  <Box component="section" sx={{p: 2, border: "1px solid grey", borderRadius: 2}}>
    <ActivityForm onActivitiesAdded = {() => console.log("Activity added")} />
      <ActivityList />
    </Box>
  )
}

export default App
