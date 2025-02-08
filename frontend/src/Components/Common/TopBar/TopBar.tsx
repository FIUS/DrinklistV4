import { Person, SettingsOutlined } from '@mui/icons-material'
import { AppBar, Button, IconButton, Slide, Toolbar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Spacer from '../Spacer'
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { RootState } from '../../../Reducer/reducerCombiner';
import InfoIcon from '@mui/icons-material/Info';
import About from './About';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { ABRECHNUNGEN, EINSTELLUNGEN, GELD_ANFORDERN, GETRAENKE, MITGLIEDER, NUTZER_DASHBOARD, PASSWORT_AENDERN, STATISTIKEN, TRANSAKTIONEN, UEBERWEISEN } from '../Internationalization/i18n';
import Cookies from 'js-cookie';
import { setRequestDialogOpen, setTransferDialogOpen } from '../../../Actions/CommonAction';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { themes } from '../Theme';
import KeyIcon from '@mui/icons-material/Key';
import PasswordDialog from '../../Admin/Members/PasswordDialog';
import { Member } from '../../../types/ResponseTypes';

type Props = {}


const TopBar = (props: Props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const drawerWidth = 240;
    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const dispatch = useDispatch()
    const [drawerOpen, setdrawerOpen] = useState(true)
    const [drawerVisible, setdrawerVisible] = useState(true)
    const [aboutDialogOpen, setaboutDialogOpen] = useState(false)
    const [passwordDialogOpen, setpasswordDialogOpen] = useState(false)

    const memberIDCookie = Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID")
    const memberIDCookieSafe = memberIDCookie ? parseInt(memberIDCookie) : -1

    const currentMember = common.members?.find(member => member.id === memberIDCookieSafe)
    const currentMemberSafe: Member = currentMember ? currentMember : { name: "", id: -1, balance: 0, hidden: false, alias: "" }

    const showDrawerButton = () => {
        if (location.pathname.startsWith("/admin")) {
            return true
        } else if (location.pathname.startsWith("/user")) {
            const isAdmin = memberIDCookieSafe === 1
            const isCorrectUser = location.pathname.endsWith(memberIDCookieSafe.toString())
            if (isAdmin || isCorrectUser) {
                return true
            }
        }
        return false
    }

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
            return <IconButton sx={{ flexGrow: 1 }} color="inherit" onClick={() => navigate("/")}><Person /></IconButton>
        } else {
            return <IconButton sx={{ flexGrow: 1 }} color="inherit" onClick={() => navigate("admin")}><SettingsOutlined /></IconButton>
        }
    }

    const hideDrawer = () => {
        setTimeout(() => { setdrawerVisible(false) }, 250)
    }

    const getIcon = () => {
        if (showDrawerButton()) {
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

    const shouldDisplayAbout = () => {
        return window.globalTS.ORGANISATION_NAME !== "" ||
            window.globalTS.ABOUT_LINK !== "" ||
            window.globalTS.PRIVACY_LINK !== "" ||
            window.globalTS.ADDITIONAL_INFORMATION !== ""
    }

    const isUser = () => {
        return parseInt(Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID") as string)
    }

    const adminDrawer = () => {
        return <Box sx={{ overflow: 'auto' }}>
            <List>

                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/")}>
                        <ListItemIcon>
                            <Person />
                        </ListItemIcon>
                        <ListItemText primary={NUTZER_DASHBOARD} />
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
                        <ListItemText primary={GETRAENKE} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/admin/members")}>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary={MITGLIEDER} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/admin/transactions")}>
                        <ListItemIcon>
                            <ReceiptLongIcon />
                        </ListItemIcon>
                        <ListItemText primary={TRANSAKTIONEN} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/admin/checkout")}>
                        <ListItemIcon>
                            <AccountBalanceIcon />
                        </ListItemIcon>
                        <ListItemText primary={ABRECHNUNGEN} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/admin/statistics")}>
                        <ListItemIcon>
                            < InsertChartIcon />
                        </ListItemIcon>
                        <ListItemText primary={STATISTIKEN} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/admin/settings")}>
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary={EINSTELLUNGEN} />
                    </ListItemButton>
                </ListItem>

            </List>
        </Box>
    }

    const userDrawer = () => {
        return <Box sx={{ overflow: 'auto' }}>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                        setdrawerOpen(false)
                        hideDrawer()
                        dispatch(setTransferDialogOpen(true))
                    }}>
                        <ListItemIcon>
                            <AccountBalanceIcon />
                        </ListItemIcon>
                        <ListItemText primary={UEBERWEISEN} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                        setdrawerOpen(false)
                        hideDrawer()
                        dispatch(setRequestDialogOpen(true))
                    }}>
                        <ListItemIcon>
                            <RequestQuoteIcon />
                        </ListItemIcon>
                        <ListItemText primary={GELD_ANFORDERN} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                        setdrawerOpen(false)
                        hideDrawer()
                        setpasswordDialogOpen(true)
                    }}>
                        <ListItemIcon>
                            <KeyIcon />
                        </ListItemIcon>
                        <ListItemText primary={PASSWORT_AENDERN} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    }

    const displayDrawer = () => {
        if (location.pathname.startsWith("/admin")) {
            return adminDrawer()
        } else if (location.pathname.startsWith("/user/")) {
            return userDrawer()
        }
        return <></>
    }

    const shouldDisplayThemeSwitch = () => {
        return window.globalTS.SHOW_THEME_SWITCH !== undefined && window.globalTS.SHOW_THEME_SWITCH
    }

    const toggleTheme = () => {
        // Check if cookie 'theme' exists
        if (Cookies.get("theme") === undefined) {
            Cookies.set("theme", "3");
        }

        // Get cookie 'theme' and increment it by 1
        let themeCookie = parseInt(Cookies.get("theme") as string);
        console.log(themeCookie);
        themeCookie = (themeCookie + 1) % themes.length;
        Cookies.set("theme", themeCookie.toString());
        // Reload page
        window.location.reload();
    }

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex" }}>
                        {getIcon()}
                        <Button
                            size="large"
                            color="inherit"
                            onClick={() =>
                                navigate(isUser() !== 1 && isUser() !== 2 ? "/user/" + isUser() : "/")
                            }
                            sx={{ display: "inline-flex" }}
                            variant="text">
                            {window.globalTS.HOME_BUTTON}
                        </Button>
                    </div>
                    <div style={{ display: "flex" }}>
                        <Spacer horizontal={20} />
                        {shouldDisplayThemeSwitch() ? <IconButton color="inherit" onClick={() => {
                            toggleTheme();
                        }}>
                            <ColorLensIcon />
                        </IconButton> : <></>}

                        {shouldDisplayAbout() ? <IconButton
                            color="inherit"
                            onClick={() => {
                                setaboutDialogOpen(true)
                            }}
                        >
                            <InfoIcon />
                        </IconButton> : <></>}
                        <About isOpen={aboutDialogOpen} close={() => setaboutDialogOpen(false)} />
                        <PasswordDialog isOpen={passwordDialogOpen} close={() => setpasswordDialogOpen(false)} member={currentMemberSafe} />
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
                    {displayDrawer()}
                </Drawer>
            </Slide>
        </>
    )
}

export default TopBar