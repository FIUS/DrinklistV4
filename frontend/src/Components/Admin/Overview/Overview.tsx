import { Button, Typography } from '@mui/material'
import React from 'react'
import SportsBarIcon from '@mui/icons-material/SportsBar';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Settings } from '@mui/icons-material';
import style from './overview.module.scss'
import { useNavigate } from 'react-router-dom';
import Spacer from '../../Common/Spacer';

type Props = {}

const Overview = (props: Props) => {
    const navigate = useNavigate();
    const headingType = "h6"
    const buttonSize = { width: 50, height: 50 }
    return (
        <div className={style.overview}>
            <Button
                size="large"
                className={style.button}
                variant='contained'
                onClick={() => navigate("drinks")}
            >
                <SportsBarIcon sx={buttonSize} />
                <Spacer horizontal={10} />
                <Typography variant={headingType}>Getränke</Typography>

            </Button>
            <Button
                size="large"
                className={style.button}
                variant='contained'
                onClick={() => navigate("members")}
            >
                <PersonIcon sx={buttonSize} />
                <Spacer horizontal={10} />
                <Typography variant={headingType}>Mitglieder</Typography>
            </Button>
            <Button
                size="large"
                className={style.button}
                variant='contained'
                onClick={() => navigate("transactions")}
            >
                <ReceiptLongIcon sx={buttonSize} />
                <Spacer horizontal={10} />
                <Typography variant={headingType}>Transaktionen</Typography>
            </Button>
            <Button
                size="large"
                className={style.button}
                variant='contained'
                onClick={() => navigate("settings")}
            >
                <Settings sx={buttonSize} />
                <Spacer horizontal={10} />
                <Typography variant={headingType}>Einstellungen</Typography>
            </Button>
        </div>
    )
}

export default Overview