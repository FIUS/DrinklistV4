import { Button, Paper, Stack, Typography } from '@mui/material'
import React from 'react'
import style from './cupon.module.scss';
import SellIcon from '@mui/icons-material/Sell';
import Spacer from '../../Common/Spacer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

type Props = {}

const CuponDisplay = (props: Props) => {
    return (
        <Paper className={style.cuponDisplayContainer}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <SellIcon sx={{color:"#ffdd00"}}/>
                <Typography variant='h5'>
                    Rentner
                </Typography>
            </Stack>
            <Spacer vertical={15} />
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Button variant="outlined" color="primary">
                    <DeleteIcon />
                </Button>
                <Button variant="outlined" color="primary">
                <EditIcon />
                </Button>
            </Stack>
        </Paper>
    )
}

export default CuponDisplay