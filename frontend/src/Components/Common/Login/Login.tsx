import { Button, TextField, Typography } from '@mui/material';
import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Spacer from '../Spacer';
import { doPostRequest } from '../StaticFunctions';
import style from './login.module.scss'

type Props = {}

const Login = (props: Props) => {
    const [searchParams,] = useSearchParams();
    const navigate = useNavigate();
    const [username, setusername] = useState("")
    const [password, setpassword] = useState("")

    return (
        <div className={style.outterContainer}>
            <Typography variant="h3">Wilkommen zur Drinklist</Typography>
            <Typography variant="h4">Bitte logge dich ein!</Typography>
            <Spacer vertical={40} />
            <TextField
                className={style.textfield}
                label="Name"
                value={username}
                onChange={(value) => { setusername(value.target.value) }}
            />
            <Spacer vertical={30} />
            <TextField
                className={style.textfield}
                label="Passwort"
                type="password"
                value={password}
                onChange={(value) => { setpassword(value.target.value) }}
            />
            <Spacer vertical={40} />
            <Button
                size='large'
                variant='contained'
                onClick={() => {
                    doPostRequest("login", { name: username, password: password }).then((value) => {
                        if (value.code === 200) {
                            const searchParam = searchParams.get("originalPath")
                            const notNullSeachParam = searchParam !== null ? searchParam : "/";

                            navigate(notNullSeachParam)
                        }
                    })
                }}
            >Login</Button>
        </div>
    )
}

export default Login