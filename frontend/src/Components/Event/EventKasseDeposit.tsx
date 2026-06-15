import React, { useEffect, useRef, useState } from 'react'
import { AddCard, ArrowBack, QrCodeScanner } from '@mui/icons-material'
import { Alert, Avatar, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { openErrorToast, openToast } from '../../Actions/CommonAction'
import { doGetRequest, doPostRequestWithEventSecret } from '../Common/StaticFunctions'
import { EventGuestResponse, EventModeStatus, Member } from '../../types/ResponseTypes'
import { BETRAG, EVENT_EINZAHLEN, EVENT_EINZAHLUNG_ERFOLG, EVENT_GAST_GELADEN, EVENT_KASSE, EVENT_MARKE_KAUFEN, EVENT_MODE_DISABLED, EVENT_SCANNEN, ZURUECK } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import style from './eventKasseAction.module.scss'

const EventKasseDeposit = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [activeGuest, setActiveGuest] = useState<Member | null>(null)
    const [activeGuestCode, setActiveGuestCode] = useState<string | null>(null)
    const [depositAmount, setDepositAmount] = useState('0')
    const [scanOpen, setScanOpen] = useState(false)
    const [depositLoading, setDepositLoading] = useState(false)
    const [lookupLoading, setLookupLoading] = useState(false)
    const autoOpenedRef = useRef(false)

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
        if (!autoOpenedRef.current && status?.enabled && activeGuest === null && !lookupLoading) {
            autoOpenedRef.current = true
            setScanOpen(true)
        }
    }, [activeGuest, status?.enabled, lookupLoading])

    const handleLookup = (code: string) => {
        setLookupLoading(true)
        return doPostRequestWithEventSecret('event/guest/lookup', { code }, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                return
            }
            if (value.code === 200) {
                const payload: EventGuestResponse = value.content
                setActiveGuest(payload.member)
                setActiveGuestCode(code)
                dispatch(openToast({ message: EVENT_GAST_GELADEN }))
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setLookupLoading(false))
    }

    const handleScan = (code: string) => {
        setScanOpen(false)
        return handleLookup(code)
    }

    const confirmDeposit = () => {
        if (!activeGuestCode) {
            return
        }
        const amount = parseFloat(depositAmount)
        if (isNaN(amount) || amount <= 0) {
            return
        }
        setDepositLoading(true)
        doPostRequestWithEventSecret('event/guest/deposit', { code: activeGuestCode, amount }, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                return
            }
            if (value.code === 200) {
                dispatch(openToast({ message: EVENT_EINZAHLUNG_ERFOLG }))
                navigate(`/event/${secret}/kasse`)
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setDepositLoading(false))
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
                <div className={style.titleBlock}>
                    <Avatar className={style.heroIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                        <AddCard />
                    </Avatar>
                    <div>
                        <Typography variant="overline" color="text.secondary">{EVENT_KASSE}</Typography>
                        <Typography variant="h3">{EVENT_MARKE_KAUFEN}</Typography>
                        <Typography variant="body1" color="text.secondary">Guthabenkarte scannen und einen Betrag aufladen.</Typography>
                    </div>
                </div>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(`/event/${secret}/kasse`)}>{ZURUECK}</Button>
            </div>

            {!activeGuest ? (
                <Paper className={style.section} elevation={2}>
                    <Typography variant="h5">Guthabenkarte auswählen</Typography>
                    <Typography variant="body2" color="text.secondary">Scanne die Karte, die aufgeladen werden soll.</Typography>
                    <Button startIcon={<QrCodeScanner />} variant="contained" size="large" onClick={() => setScanOpen(true)} disabled={lookupLoading}>
                        {EVENT_SCANNEN}
                    </Button>
                </Paper>
            ) : (
                <>
                    <Paper className={style.balanceCard} elevation={2}>
                        <Typography variant="h6">{guestName}</Typography>
                        <Typography variant="h2" sx={{ color: balanceColor }}>
                            {balance.toFixed(2)} EUR
                        </Typography>
                    </Paper>
                    <Paper className={style.section} elevation={2}>
                        <Typography variant="h5">Betrag aufladen</Typography>
                        <TextField
                            label={BETRAG}
                            value={depositAmount}
                            onChange={(event) => setDepositAmount(event.target.value)}
                            type="number"
                            fullWidth
                            margin="dense"
                        />
                        <Stack direction="row" spacing={2} className={style.actions}>
                            <Button variant="contained" onClick={confirmDeposit} disabled={depositLoading}>{EVENT_EINZAHLEN}</Button>
                        </Stack>
                    </Paper>
                </>
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

export default EventKasseDeposit
