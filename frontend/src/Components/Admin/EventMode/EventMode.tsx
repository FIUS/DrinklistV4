import React, { useEffect, useState } from 'react'
import { Assessment, EventAvailable, Person, PointOfSale, QrCode } from '@mui/icons-material'
import { Alert, Avatar, Button, Chip, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { doGetRequest } from '../../Common/StaticFunctions'
import { useDispatch } from 'react-redux'
import { openErrorToast } from '../../../Actions/CommonAction'
import { EventModeStatus } from '../../../types/ResponseTypes'
import { EVENT_GAST, EVENT_KASSE, EVENT_MODE, EVENT_MODE_DISABLED, EVENT_QR_ANZEIGEN, EVENT_ZUSAMMENFASSUNG, OEFFNEN } from '../../Common/Internationalization/i18n'
import style from './eventMode.module.scss'

type EventCardProps = {
    title: string,
    description: string,
    icon: React.ReactNode,
    onOpen: () => void,
    onShowQr?: () => void,
    enabled: boolean
}

const EventCard = (props: EventCardProps) => {
    return (
        <Paper className={style.card} elevation={2}>
            <div className={style.cardHeader}>
                <Avatar className={style.cardIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                    {props.icon}
                </Avatar>
                <div>
                    <Typography variant="h5">{props.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{props.description}</Typography>
                </div>
            </div>
            <div className={style.cardActions}>
                <Button variant="contained" onClick={props.onOpen} disabled={!props.enabled}>{OEFFNEN}</Button>
                {props.onShowQr ? (
                    <Button variant="outlined" startIcon={<QrCode />} onClick={props.onShowQr} disabled={!props.enabled}>
                        {EVENT_QR_ANZEIGEN}
                    </Button>
                ) : null}
            </div>
        </Paper>
    )
}

const EventMode = () => {
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    const enabled = status?.enabled === true

    const dispatch = useDispatch()

    const openEvent = async (targetPath: string) => {
        const resp = await doGetRequest('event/secret')
        if (resp.code === 200 && resp.content && resp.content.secret) {
            const secret = resp.content.secret
            if (targetPath === 'guest') {
                navigate('/event/guest')
            } else {
                navigate(`/event/${secret}/${targetPath}`)
            }
        } else {
            if (resp.code === 403) {
                dispatch(openErrorToast())
            }
            navigate('/admin/event-mode')
        }
    }

    return (
        <main className={style.container}>
            <header className={style.header}>
                <div className={style.titleBlock}>
                    <Avatar className={style.heroIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                        <EventAvailable />
                    </Avatar>
                    <div>
                        <Typography variant="overline" color="text.secondary">Veranstaltung</Typography>
                        <Typography variant="h3">{EVENT_MODE}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Kasse, Gastzugang und Auswertung zentral verwalten.
                        </Typography>
                    </div>
                </div>
                <Chip
                    color={enabled ? 'success' : 'default'}
                    label={loading ? 'Status wird geladen' : enabled ? 'Aktiv' : 'Deaktiviert'}
                    variant={enabled ? 'filled' : 'outlined'}
                />
            </header>
            {!loading && status?.enabled === false ? (
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            ) : null}
            <div className={style.cardRow}>
                <EventCard
                    title={EVENT_KASSE}
                    description="Verkäufe, Guthaben und Auszahlungen bearbeiten."
                    icon={<PointOfSale />}
                    onOpen={() => openEvent('kasse')}
                    onShowQr={() => navigate('/admin/event-mode/qr/kasse')}
                    enabled={enabled}
                />
                <EventCard
                    title={EVENT_GAST}
                    description="Öffentlicher Zugang zur Guthabenkarte."
                    icon={<Person />}
                    onOpen={() => openEvent('guest')}
                    onShowQr={() => navigate('/admin/event-mode/qr/guest')}
                    enabled={enabled}
                />
                <EventCard
                    title={EVENT_ZUSAMMENFASSUNG}
                    description="Umsatz, Verkäufe und Eventabschluss prüfen."
                    icon={<Assessment />}
                    onOpen={() => navigate('/admin/event-mode/summary')}
                    enabled={enabled}
                />
            </div>
        </main>
    )
}

export default EventMode
