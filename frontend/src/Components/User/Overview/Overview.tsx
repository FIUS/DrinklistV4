import { TextField, Typography } from '@mui/material'
import React from 'react'
import UserButton from '../UserButton/UserButton'
import style from './overview.module.scss'

type Props = {}

const Overview = (props: Props) => {
    return (
        <div className={style.outterContainer}>
            <div className={style.headline}>
                <Typography variant='h4'>Wer bist du?</Typography>
            </div>

            <TextField className={style.input} placeholder="Name" />

            <div className={style.buttonArea}>
                <UserButton name='Paul' id={5} />
                <UserButton name='Tom' id={5} />
                <UserButton name='Peter' id={5} />
            </div>
        </div>
    )
}

export default Overview