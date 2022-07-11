import { Person, SettingsOutlined } from '@mui/icons-material'
import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import React from 'react'
import Spacer from '../Spacer'
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {}

const TopBar = (props: Props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigationButton = () => {
        if (location.pathname.startsWith("/admin")) {
            return <Button onClick={() => navigate("/")}><Person /></Button>
        } else {
            return <Button onClick={() => navigate("admin")}><SettingsOutlined /></Button>
        }
    }
    return (
        <AppBar position="static">
            <Toolbar>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Drinklist
                </Typography>
                {navigationButton()}
                <Spacer horizontal={20} />
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    )
}

export default TopBar