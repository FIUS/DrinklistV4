import { Button, Paper } from '@mui/material'
import React from 'react'
import style from './navigationbutton.module.scss'
import { useNavigate } from 'react-router-dom';

type Props = {
    destination: string
}

const NavigationButton = (props: Props) => {
    const navigate = useNavigate();

    return (
        <Paper className={style.footer}>
            <Button
                className={style.footerButton}
                variant='contained'
                onClick={() => navigate(props.destination)}>
                Zurück
            </Button>
        </Paper>
    )
}

export default NavigationButton