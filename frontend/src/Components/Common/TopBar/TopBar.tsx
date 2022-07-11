import { Person, SettingsOutlined } from '@mui/icons-material'
import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import React from 'react'
import Spacer from '../Spacer'
import { useLocation, useNavigate } from 'react-router-dom';
import { RootStateOrAny, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doPostRequest } from '../StaticFunctions';

type Props = {}

const TopBar = (props: Props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);

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
                <Button color="inherit" onClick={() => {
                    if (common.isLoggedIn) {
                        doPostRequest("logout", "")
                    }
                    navigate("/login")
                }}>{common.isLoggedIn ? "Logout" : "Login"}</Button>
            </Toolbar>
        </AppBar>
    )
}

export default TopBar