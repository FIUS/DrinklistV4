import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast } from '../../../Actions/CommonAction'
import { doPostRequest } from '../../Common/StaticFunctions'
import style from './settings.module.scss'

type Props = {
    textfielLabel: string,
    requestPath: string
}

const PasswordChange = (props: Props) => {
    const [text, settext] = useState("")
    const dispatch = useDispatch()

    return (
        <div className={style.passwordRow}>
            <TextField
                label={props.textfielLabel}
                value={text}
                onChange={(value) => settext(value.target.value)}
                type="password"
            />
            <Button onClick={() => {
                if (text.length > 5) {
                    doPostRequest(props.requestPath, { password: text }).then((value) => {
                        if (value.code === 200) {
                            dispatch(openToast({ message: "Passwort geändert" }))
                            settext("")
                        } else {
                            dispatch(openErrorToast())
                        }
                    })
                } else {
                    dispatch(openToast({ headline: "Passwort zu kurz", message: "Mindestens 6 Zeichen", type: "error" }))
                }
            }}
                variant="outlined"
            >
                Passwort setzen
            </Button>
        </div>
    )
}

export default PasswordChange