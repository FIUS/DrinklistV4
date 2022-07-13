import { Person, SettingsOutlined } from '@mui/icons-material'
import { AppBar, Button, IconButton, Slide, Toolbar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Spacer from '../Spacer'
import { useLocation, useNavigate } from 'react-router-dom';
import { RootStateOrAny, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doPostRequest } from '../StaticFunctions';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Settings } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

type Props = {}

declare global {
    interface Window { globalTS: { MOBILE_THRESHOLD: number }; }
}

const TopBar = (props: Props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const drawerWidth = 240;
    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);
    const [drawerOpen, setdrawerOpen] = useState(true)
    const [drawerVisible, setdrawerVisible] = useState(true)

    useEffect(() => {
        if (location.pathname.startsWith("/admin") && window.innerWidth > window.globalTS.MOBILE_THRESHOLD) {
            setdrawerOpen(true)
            setdrawerVisible(true)
        } else {
            setdrawerOpen(false)
            setdrawerVisible(false)
        }
    }, [location.pathname])


    const navigationButton = () => {
        if (location.pathname.startsWith("/admin")) {
            return <Button sx={{ flexGrow: 1 }} color="inherit" onClick={() => navigate("/")}><Person /></Button>
        } else {
            return <Button sx={{ flexGrow: 1 }} color="inherit" onClick={() => navigate("admin")}><SettingsOutlined /></Button>
        }
    }

    const hideDrawer = () => {
        setTimeout(() => { setdrawerVisible(false) }, 250)
    }

    const getIcon = () => {
        if (location.pathname.startsWith("/admin")) {
            return <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => {
                    if (drawerOpen) {
                        setdrawerOpen(false)
                        hideDrawer()
                    }
                    else {
                        setdrawerOpen(true)
                        setdrawerVisible(true)
                    }
                }}
                edge="start"
                sx={{
                    marginRight: 5
                }}
            >
                <MenuIcon />
            </IconButton>
        } else {
            return <></>
        }
    }

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex" }}>
                        {getIcon()}

                        <Button size="large" color="inherit" onClick={() => navigate("/")} sx={{ display: "inline-flex" }}>
                            Drinklist
                        </Button>
                    </div>
                    <div style={{ display: "flex" }}>
                        {navigationButton()}
                        <Spacer horizontal={20} />
                        <Button color="inherit" onClick={() => {
                            if (common.isLoggedIn) {
                                doPostRequest("logout", "")
                            }
                            navigate("/login")
                        }}>{common.isLoggedIn ? "Logout" : "Login"}</Button>
                    </div>
                </Toolbar>
            </AppBar>
            <Slide direction="right" in={drawerOpen}>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: drawerVisible ? "" : "none",
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto' }}>
                        <List>

                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate("/")}>
                                    <ListItemIcon>
                                        <Person />
                                    </ListItemIcon>
                                    <ListItemText primary="Nutzer Dashboard" />
                                </ListItemButton>
                            </ListItem>

                        </List>
                        <Divider />
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate("/admin/drinks")}>
                                    <ListItemIcon>
                                        <SportsBarIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Getränke" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate("/admin/members")}>
                                    <ListItemIcon>
                                        <PersonIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Mitglieder" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate("/admin/transactions")}>
                                    <ListItemIcon>
                                        <ReceiptLongIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Transaktionen" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate("/admin/settings")}>
                                    <ListItemIcon>
                                        <Settings />
                                    </ListItemIcon>
                                    <ListItemText primary="Einstellungen" />
                                </ListItemButton>
                            </ListItem>

                        </List>
                    </Box>
                </Drawer>
            </Slide>
        </>
    )
}

export default TopBar