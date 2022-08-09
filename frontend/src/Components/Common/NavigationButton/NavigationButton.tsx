import { Button } from '@mui/material'
import React from 'react'
import style from './navigationbutton.module.scss'
import { useNavigate } from 'react-router-dom';

type Props = {
    destination: string
}

const NavigationButton = (props: Props) => {
    const navigate = useNavigate();

    return (
        <div className={style.footer}>
            <Button
                className={style.footerButton}
                variant='contained'
                onClick={() => navigate(props.destination)}
                sx={{ backgroundColor: "primary.main" }}
            >
                Zurück
            </Button>
        </div>
    )
}

export default NavigationButton