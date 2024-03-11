import { Button, Paper, Stack, Typography } from '@mui/material'
import React from 'react'
import style from './details.module.scss'
import CloseIcon from '@mui/icons-material/Close';

type Props = {
    name: String,
    amount:number,
    removeUser: () => void,
}

const RequestUserItem = (props: Props) => {

    return (
        <Paper sx={{ backgroundColor: "#eeeeee" }} className={style.transferBox}>
            <Stack className={style.nameHeadline} direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <div className={style.nameHeadline}>
                    <Typography variant='h5'> {props.name}</Typography>
                </div>
                <Stack direction="row" alignItems="center" gap={"15px"}>
                    <Typography variant='h6'>
                        {props.amount > 0 ? props.amount.toFixed(2) : "__,__"}€
                    </Typography>
                    <Button color='error' variant='contained' size='small' onClick={() => { props.removeUser()}}>
                        <CloseIcon />
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    )
}

export default RequestUserItem