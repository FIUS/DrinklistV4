import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import React from 'react'

type Props = {}

const TopBar = (props: Props) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Drinklist
                </Typography>
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    )
}

export default TopBar