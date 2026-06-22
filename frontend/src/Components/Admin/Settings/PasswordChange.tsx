import { LockReset } from '@mui/icons-material'
import { Avatar, Button, InputAdornment, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { format } from 'react-string-format'
import { openErrorToast, openToast } from '../../../Actions/CommonAction'
import {
    NEUES_PASSWORT_FESTLEGEN,
    PASSWORD_MIN_LAENGE,
    PASSWORT_GEAENDERT,
    PASSWORT_ZU_KURZ
} from '../../Common/Internationalization/i18n'
import { doPostRequest } from '../../Common/StaticFunctions'
import style from './settings.module.scss'

type Props = {
    textfielLabel: string,
    description: string,
    requestPath: string,
    icon: React.ReactNode
}

const PasswordChange = ({ textfielLabel, description, requestPath, icon }: Props) => {
    const dispatch = useDispatch()
    const [text, setText] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const minPasswordLength = 6

    const savePassword = () => {
        if (text.length < minPasswordLength) {
            dispatch(openToast({
                headline: PASSWORT_ZU_KURZ,
                message: format(PASSWORD_MIN_LAENGE, minPasswordLength),
                type: 'error'
            }))
            return
        }

        setIsSaving(true)
        doPostRequest(requestPath, { password: text }).then((value) => {
            if (value.code === 200) {
                dispatch(openToast({ message: PASSWORT_GEAENDERT }))
                setText('')
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setIsSaving(false))
    }

    return (
        <div className={style.passwordRow}>
            <div className={style.passwordInfo}>
                <Avatar className={style.passwordIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                    {icon}
                </Avatar>
                <div>
                    <Typography variant="h6">{textfielLabel}</Typography>
                    <Typography variant="body2" color="text.secondary">{description}</Typography>
                </div>
            </div>
            <div className={style.passwordControls}>
                <TextField
                    label={textfielLabel}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            savePassword()
                        }
                    }}
                    type="password"
                    fullWidth
                    helperText={format(PASSWORD_MIN_LAENGE, minPasswordLength)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockReset />
                            </InputAdornment>
                        )
                    }}
                />
                <Button
                    onClick={savePassword}
                    variant="contained"
                    disabled={isSaving || text.length === 0}
                >
                    {NEUES_PASSWORT_FESTLEGEN}
                </Button>
            </div>
        </div>
    )
}

export default PasswordChange
