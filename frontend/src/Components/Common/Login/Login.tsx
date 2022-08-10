import { Button, FormControl, TextField, Typography } from '@mui/material';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { openToast } from '../../../Actions/CommonAction';
import { FALSCHES_PASSWORT, FEHLER, LOGIN, NAME, PASSWORT } from '../Internationalization/i18n';
import Spacer from '../Spacer';
import { doPostRequest } from '../StaticFunctions';
import style from './login.module.scss'

type Props = {}

const Login = (props: Props) => {
    const [searchParams,] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setusername] = useState("")
    const [password, setpassword] = useState("")

    const login = () => {
        doPostRequest("login", { name: username, password: password }).then((value) => {
            if (value.code === 200) {
                const searchParam = searchParams.get("originalPath")
                const notNullSeachParam = searchParam !== null ? searchParam : "/";

                navigate(notNullSeachParam)
            } else {
                dispatch(openToast({ message: FALSCHES_PASSWORT, type: "error", headline: FEHLER }))
            }
        })
    }

    return (
        <div className={style.outterContainer}>
            <Typography variant="h3">{window.globalTS.WELCOME_TEXT_0}</Typography>
            <Typography variant="h4">{window.globalTS.WELCOME_TEXT_1}</Typography>
            <Spacer vertical={40} />
            <TextField
                className={style.textfield}
                label={NAME}
                value={username}
                onChange={(value) => { setusername(value.target.value) }}
            />

            <Spacer vertical={30} />
            <form className={style.textfield} noValidate autoComplete="off" onSubmit={(event) => { event.preventDefault(); console.log("slsdlf"); login() }}>
                <FormControl className={style.form}>
                    <TextField
                        fullWidth
                        label={PASSWORT}
                        type="password"
                        value={password}
                        onChange={(value) => { setpassword(value.target.value) }}
                    />
                </FormControl>
            </form>
            <Spacer vertical={40} />
            <Button
                size='large'
                variant='contained'
                onClick={() => {
                    login()
                }}
            >
                {LOGIN}
            </Button>
        </div>
    )
}

export default Login