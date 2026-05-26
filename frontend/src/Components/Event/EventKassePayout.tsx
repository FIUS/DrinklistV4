import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Paper, Stack, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { openErrorToast, openToast } from '../../Actions/CommonAction'
import { doGetRequest, doPostRequest } from '../Common/StaticFunctions'
import { EventGuestResponse, EventModeStatus, Member } from '../../types/ResponseTypes'
import { EVENT_AUSZAHLEN, EVENT_AUSZAHLUNG_ERFOLG, EVENT_GAST_GELADEN, EVENT_KASSE, EVENT_MODE_DISABLED, EVENT_RESTGELD_AUSZAHLEN, EVENT_SCANNEN, ZURUECK } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import style from './eventKasseAction.module.scss'

const EventKassePayout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [activeGuest, setActiveGuest] = useState<Member | null>(null)
    const [activeGuestCode, setActiveGuestCode] = useState<string | null>(null)
    const [scanOpen, setScanOpen] = useState(false)
    const autoOpenedRef = useRef(false)

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    useEffect(() => {
        if (!autoOpenedRef.current && status?.enabled && activeGuest === null) {
            autoOpenedRef.current = true
            setScanOpen(true)
        }
    }, [activeGuest, status?.enabled])

    const handleLookup = (code: string) => {
        doPostRequest('event/guest/lookup', { code }).then((value) => {
            if (value.code === 200) {
                const payload: EventGuestResponse = value.content
                setActiveGuest(payload.member)
                setActiveGuestCode(code)
                dispatch(openToast({ message: EVENT_GAST_GELADEN }))
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const handleScan = (code: string) => {
        setScanOpen(false)
        handleLookup(code)
    }

    const confirmPayout = () => {
        if (!activeGuestCode) {
            return
        }
        doPostRequest('event/guest/payout', { code: activeGuestCode }).then((value) => {
            if (value.code === 200) {
                dispatch(openToast({ message: EVENT_AUSZAHLUNG_ERFOLG }))
                navigate('/event/kasse')
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    if (status?.enabled === false) {
        return (
            <div className={style.container}>
                <Typography variant="h4">{EVENT_KASSE}</Typography>
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            </div>
        )
    }

    const balance = activeGuest?.balance ?? 0
    const balanceColor = balance >= 0 ? 'limegreen' : 'darkred'
    const guestName = activeGuest ? (activeGuest.alias !== '' ? activeGuest.alias : activeGuest.name) : ''

    return (
        <div className={style.container}>
            <div className={style.headerRow}>
                <Typography variant="h4">{EVENT_RESTGELD_AUSZAHLEN}</Typography>
                <Button variant="outlined" onClick={() => navigate('/event/kasse')}>{ZURUECK}</Button>
            </div>

            {!activeGuest ? (
                <Paper className={style.section} elevation={2}>
                    <Button variant="contained" size="large" onClick={() => setScanOpen(true)}>
                        {EVENT_SCANNEN}
                    </Button>
                </Paper>
            ) : (
                <Paper className={style.balanceCard} elevation={2}>
                    <Typography variant="h6">{guestName}</Typography>
                    <Typography variant="h2" sx={{ color: balanceColor }}>
                        {balance.toFixed(2)} EUR
                    </Typography>
                    <Stack direction="row" spacing={2} className={style.actions}>
                        <Button variant="contained" onClick={confirmPayout}>{EVENT_AUSZAHLEN}</Button>
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

export default EventKassePayout
