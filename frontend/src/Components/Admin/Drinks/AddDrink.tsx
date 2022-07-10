import { Button, Paper, TextField } from '@mui/material'
import React, { useState } from 'react';
import style from './drinks.module.scss';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Spacer from '../../Common/Spacer';
import { Add } from '@mui/icons-material';

type Props = {}

const AddDrink = (props: Props) => {
    const [isHovered, setisHovered] = useState(false)

    return (
        <Paper
            className={style.addDrinkPaper}
            onMouseEnter={() => setisHovered(true)}
            onMouseLeave={() => setisHovered(false)}
            elevation={isHovered ? 5 : 3}
        >
            <TextField placeholder='Getränkename' variant='standard' />
            <Spacer vertical={20} />
            <div className={style.buttonsContainer} >
                <div className={style.smallTextFieldContainer}>
                    <TextField className={style.smallTextField} placeholder='Preis in Euro' variant='standard' />
                    <Spacer horizontal={5} />
                    <SellOutlinedIcon />
                </div>
                <div className={style.smallTextFieldContainer}>
                    <TextField className={style.smallTextField} placeholder='Flaschen-Anzahl' variant='standard' />
                    <Spacer horizontal={5} />
                    <Inventory2OutlinedIcon />
                </div>
                <Button variant='outlined'>
                    <Add />
                </Button>
            </div>
        </Paper>
    )
}

export default AddDrink