import React, { useEffect, useState } from 'react'
import { ArrowBack, Print, QrCode2 } from '@mui/icons-material'
import { Alert, Avatar, Button, Paper, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openErrorToast } from '../../../Actions/CommonAction'
import QRCode from 'react-qr-code'
import { doGetRequest } from '../../Common/StaticFunctions'
import { EventModeStatus } from '../../../types/ResponseTypes'
import { EVENT_DRUCKEN, EVENT_GAST, EVENT_KASSE, EVENT_MODE, EVENT_MODE_DISABLED, EVENT_QR_CODE, ZURUECK } from '../../Common/Internationalization/i18n'
import style from './eventQrPage.module.scss'

const buildFrontendBase = (frontendDomain: string | null) => {
    if (frontendDomain === null || frontendDomain.trim() === '') {
        return window.location.origin
    }

    const trimmed = frontendDomain.trim()
    const normalized = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `http://${trimmed}`

    return normalized.replace(/\/+$/, '')
}

const EventQrPage = () => {
    const navigate = useNavigate()
    const { target } = useParams()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [secret, setSecret] = useState(null)

    const dispatch = useDispatch()

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
        doGetRequest('event/secret').then((value) => {
            if (value.code === 200 && value.content && value.content.secret) {
                setSecret(value.content.secret)
            } else if (value.code === 403) {
                dispatch(openErrorToast())
            }
        })
    }, [dispatch])

    const isKasse = target === 'kasse'
    const label = isKasse ? EVENT_KASSE : EVENT_GAST
    const baseUrl = buildFrontendBase(status?.frontendDomain ?? null)
    const fullUrl = isKasse ? (secret ? `${baseUrl}/event/${secret}/kasse` : `${baseUrl}/event/kasse`) : `${baseUrl}/event/guest`

    if (status?.enabled === false) {
        return (
            <main className={style.container}>
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate('/admin/event-mode')}>{ZURUECK}</Button>
            </main>
        )
    }

    return (
        <main className={style.container}>
            <header className={style.header}>
                <Avatar className={style.heroIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                    <QrCode2 />
                </Avatar>
                <div>
                    <Typography variant="overline" color="text.secondary">{EVENT_MODE}</Typography>
                    <Typography variant="h3">{EVENT_QR_CODE}: {label}</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Diesen Code am Eingang oder an der Kasse bereitstellen.
                    </Typography>
                </div>
            </header>
            <Paper className={style.qrBox} elevation={2}>
                <div className={style.qrCode}>
                    <QRCode value={fullUrl} size={320} />
                </div>
                <Typography className={style.url} variant="body2" color="text.secondary">{fullUrl}</Typography>
            </Paper>
            <div className={style.actions}>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate('/admin/event-mode')}>{ZURUECK}</Button>
                <Button startIcon={<Print />} variant="contained" onClick={() => window.print()}>{EVENT_DRUCKEN}</Button>
            </div>
        </main>
    )
}

export default EventQrPage
