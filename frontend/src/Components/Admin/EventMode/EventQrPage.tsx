import React, { useEffect, useState } from 'react'
import { Button, Paper, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { doGetRequest } from '../../Common/StaticFunctions'
import { EventModeStatus } from '../../../types/ResponseTypes'
import { EVENT_DRUCKEN, EVENT_GAST, EVENT_KASSE, EVENT_MODE_DISABLED, EVENT_QR_CODE, ZURUECK } from '../../Common/Internationalization/i18n'
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

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    const isKasse = target === 'kasse'
    const label = isKasse ? EVENT_KASSE : EVENT_GAST
    const path = isKasse ? '/event/kasse' : '/event/guest'
    const baseUrl = buildFrontendBase(status?.frontendDomain ?? null)
    const fullUrl = `${baseUrl}${path}`

    if (status?.enabled === false) {
        return (
            <div className={style.container}>
                <Typography variant="h5">{EVENT_MODE_DISABLED}</Typography>
                <Button variant="outlined" onClick={() => navigate('/admin/event-mode')}>{ZURUECK}</Button>
            </div>
        )
    }

    return (
        <div className={style.container}>
            <Typography variant="h4">{EVENT_QR_CODE}: {label}</Typography>
            <Paper className={style.qrBox} elevation={2}>
                <QRCode value={fullUrl} size={320} />
            </Paper>
            <div className={style.actions}>
                <Button variant="outlined" onClick={() => navigate('/admin/event-mode')}>{ZURUECK}</Button>
                <Button variant="contained" onClick={() => window.print()}>{EVENT_DRUCKEN}</Button>
            </div>
        </div>
    )
}

export default EventQrPage
