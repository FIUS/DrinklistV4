import { SettingsOutlined } from '@mui/icons-material'
import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import React from 'react'
import Spacer from '../Spacer'
import { useNavigate } from 'react-router-dom';

type Props = {}

const TopBar = (props: Props) => {
    const navigate = useNavigate();

    return (
        <AppBar position="static">
            <Toolbar>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Drinklist
                </Typography>
                <Button onClick={() => navigate("admin")}><SettingsOutlined /></Button>
                <Spacer horizontal={20} />
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    )
}

export default TopBar