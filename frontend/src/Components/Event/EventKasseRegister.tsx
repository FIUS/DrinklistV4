import React, { useEffect, useState } from 'react'
import { ArrowBack, PersonAdd, QrCodeScanner } from '@mui/icons-material'
import { Alert, Avatar, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { openErrorToast, openToast } from '../../Actions/CommonAction'
import { doGetRequest, doPostRequestWithEventSecret } from '../Common/StaticFunctions'
import { EventGuestResponse, EventModeStatus } from '../../types/ResponseTypes'
import { EVENT_GAST_ANGELEGT, EVENT_GAST_EXISTIERT, EVENT_KASSE, EVENT_MODE_DISABLED, EVENT_NEUER_GAST, EVENT_SCANNEN, EVENT_STARTGUTHABEN, ZURUECK, OK } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import style from './eventKasseAction.module.scss'
import { parseMoneyInputToCents } from '../Common/StaticFunctionsTyped'

const EventKasseRegister = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [scanOpen, setScanOpen] = useState(false)
    const [guestCode, setGuestCode] = useState<string | null>(null)
    const [initialBalance, setInitialBalance] = useState('0')
    const [loadingAvailability, setloadingAvailability] = useState(false)
    const [okClicked, setokClicked] = useState(false)

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    const params = useParams()
    const secret = params.secret

    useEffect(() => {
        if (guestCode === null && status?.enabled && !loadingAvailability) {
            setScanOpen(true)
        } else {
            setScanOpen(false)
        }
    }, [guestCode, status?.enabled, loadingAvailability])

    const handleScan = (code: string) => {
        setScanOpen(false)
        setloadingAvailability(true)
        // Check if guest already exists; if so, notify and return to kasse
        return doPostRequestWithEventSecret('event/guest/lookup', { code }, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                navigate(`/event/${secret}/kasse`)
                return
            }
            if (value.code === 200) {
                // guest exists
                dispatch(openToast({ message: EVENT_GAST_EXISTIERT, type: "error" }))
                navigate(`/event/${secret}/kasse`)
            } else if (value.code === 404) {
                // guest not found — proceed with registration flow (allow initial balance input)
                setGuestCode(code)
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setloadingAvailability(false))
    }

    const confirmRegister = () => {
        setokClicked(true)
        if (!guestCode) {
            setokClicked(false)
            return
        }
        const payload = {
            code: guestCode,
            initialBalance: parseMoneyInputToCents(initialBalance)
        }
        doPostRequestWithEventSecret('event/guest/register', payload, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                navigate(`/event/${secret}/kasse`)
                return
            }
            if (value.code === 200) {
                const response: EventGuestResponse = value.content
                dispatch(openToast({ message: EVENT_GAST_ANGELEGT }))
                if (response.member) {
                    navigate(`/event/${secret}/kasse`)
                }
            } else if (value.code === 409) {
                dispatch(openToast({ message: EVENT_GAST_EXISTIERT, type: "error" }))
                navigate(`/event/${secret}/kasse`)
            } else {
                dispatch(openErrorToast())
            }
        }).catch(() => {
            dispatch(openErrorToast())
        }).finally(() => setokClicked(false))
    }

    if (status?.enabled === false) {
        return (
            <div className={style.container}>
                <Typography variant="h4">{EVENT_KASSE}</Typography>
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            </div>
        )
    }

    return (
        <div className={style.container}>
            <div className={style.headerRow}>
                <div className={style.titleBlock}>
                    <Avatar className={style.heroIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                        <PersonAdd />
                    </Avatar>
                    <div>
                        <Typography variant="overline" color="text.secondary">{EVENT_KASSE}</Typography>
                        <Typography variant="h3">{EVENT_NEUER_GAST}</Typography>
                        <Typography variant="body1" color="text.secondary">Neue Guthabenkarte scannen und Startguthaben festlegen.</Typography>
                    </div>
                </div>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(`/event/${secret}/kasse`)}>{ZURUECK}</Button>
            </div>
            {!guestCode ? (
                <Paper className={style.section} elevation={2}>
                    <Typography variant="h5">Guthabenkarte erfassen</Typography>
                    <Typography variant="body2" color="text.secondary">Scanne eine noch nicht registrierte Karte.</Typography>
                    <Button startIcon={<QrCodeScanner />} variant="contained" size="large" onClick={() => setScanOpen(true)} disabled={loadingAvailability}>
                        {EVENT_SCANNEN}
                    </Button>
                </Paper>
            ) : (
                <Paper className={style.section} elevation={2}>
                    <Typography variant="h5">Startguthaben</Typography>
                    <TextField
                        label={EVENT_STARTGUTHABEN}
                        value={initialBalance}
                        onChange={(event) => setInitialBalance(event.target.value)}
                        type="number"
                        fullWidth
                        margin="dense"
                    />
                    <Stack direction="row" spacing={2} className={style.actions}>
                        <Button variant="contained" onClick={confirmRegister} disabled={okClicked}>{OK}</Button>
                    </Stack>
                </Paper>
            )}

            <EventScanDialog
                open={scanOpen}
                title={EVENT_SCANNEN}
                onClose={() => setScanOpen(false)}
                onScanned={handleScan}
            />
        </div>
    )
}

export default EventKasseRegister
