import { Button } from '@mui/material'
import React from 'react'
import style from './userbutton.module.scss'
import { useNavigate } from 'react-router-dom';

type Props = {
    id: number,
    name: string
}

const UserButton = (props: Props) => {
    const navigate = useNavigate();

    return (
        <Button
            variant='contained'
            className={style.button}
            onClick={() => navigate("/user/" + props.id)}
        >{props.name}</Button>
    )
}

export default UserButton