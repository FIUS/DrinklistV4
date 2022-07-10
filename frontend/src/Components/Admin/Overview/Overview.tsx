import { Button } from '@mui/material'
import React from 'react'
import SportsBarIcon from '@mui/icons-material/SportsBar';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Settings } from '@mui/icons-material';
import style from './overview.module.scss'

type Props = {}

const Overview = (props: Props) => {
    return (
        <div className={style.overview}>
            <Button
                size="large"
                className={style.button}
                variant='contained'>
                Getränke <SportsBarIcon />
            </Button>
            <Button
                size="large"
                className={style.button}
                variant='contained'>
                Mitglieder <PersonIcon />
            </Button>
            <Button
                size="large"
                className={style.button}
                variant='contained'>
                Transaktionen <ReceiptLongIcon />
            </Button>
            <Button
                size="large"
                className={style.button}
                variant='contained'>
                Einstellungen <Settings />
            </Button>
        </div>
    )
}

export default Overview