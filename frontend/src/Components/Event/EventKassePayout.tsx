import React, { useEffect, useRef, useState } from 'react'
import { AccountBalanceWallet, ArrowBack, QrCodeScanner } from '@mui/icons-material'
import { Alert, Avatar, Button, Paper, Stack, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { openErrorToast, openToast } from '../../Actions/CommonAction'
import { doGetRequest, doPostRequestWithEventSecret } from '../Common/StaticFunctions'
import { EventGuestResponse, EventModeStatus, Member } from '../../types/ResponseTypes'
import { EVENT_AUSZAHLEN, EVENT_AUSZAHLUNG_ERFOLG, EVENT_GAST_GELADEN, EVENT_KASSE, EVENT_MODE_DISABLED, EVENT_NO_GUTHABENKARTE, EVENT_RESTGELD_AUSZAHLEN, EVENT_SCANNEN, ZURUECK } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import style from './eventKasseAction.module.scss'
import { formatMoney } from '../Common/StaticFunctionsTyped'

const EventKassePayout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [activeGuest, setActiveGuest] = useState<Member | null>(null)
    const [activeGuestCode, setActiveGuestCode] = useState<string | null>(null)
    const [scanOpen, setScanOpen] = useState(false)
    const [payoutLoading, setPayoutLoading] = useState(false)
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
            } else if (value.code === 404) {
                dispatch(openToast({ message: EVENT_NO_GUTHABENKARTE, type: 'error' }))
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setLookupLoading(false))
    }

    const handleScan = (code: string) => {
        setScanOpen(false)
        return handleLookup(code)
    }

    const confirmPayout = () => {
        if (!activeGuestCode) {
            return
        }
        setPayoutLoading(true)
        doPostRequestWithEventSecret('event/guest/payout', { code: activeGuestCode }, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                return
            }
            if (value.code === 200) {
                dispatch(openToast({ message: EVENT_AUSZAHLUNG_ERFOLG }))
                navigate(`/event/${secret}/kasse`)
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setPayoutLoading(false))
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
                        <AccountBalanceWallet />
                    </Avatar>
                    <div>
                        <Typography variant="overline" color="text.secondary">{EVENT_KASSE}</Typography>
                        <Typography variant="h3">{EVENT_RESTGELD_AUSZAHLEN}</Typography>
                        <Typography variant="body1" color="text.secondary">Restguthaben prüfen und vollständig auszahlen.</Typography>
                    </div>
                </div>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate(`/event/${secret}/kasse`)}>{ZURUECK}</Button>
            </div>

            {!activeGuest ? (
                <Paper className={style.section} elevation={2}>
                    <Typography variant="h5">Guthabenkarte auswählen</Typography>
                    <Typography variant="body2" color="text.secondary">Scanne die Karte, deren Restguthaben ausgezahlt wird.</Typography>
                    <Button startIcon={<QrCodeScanner />} variant="contained" size="large" onClick={() => setScanOpen(true)} disabled={lookupLoading}>
                        {EVENT_SCANNEN}
                    </Button>
                </Paper>
            ) : (
                <Paper className={style.balanceCard} elevation={2}>
                    <Typography variant="h6">{guestName}</Typography>
                    <Typography variant="h2" sx={{ color: balanceColor }}>
                        {formatMoney(balance)} EUR
                    </Typography>
                    <Stack direction="row" spacing={2} className={style.actions}>
                        <Button variant="contained" onClick={confirmPayout} disabled={payoutLoading}>{EVENT_AUSZAHLEN}</Button>
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
