import React, { useState } from 'react'
import { QrCodeScanner } from '@mui/icons-material'
import { Avatar, Button, Paper, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { openErrorToast } from '../../../Actions/CommonAction'
import { doPostRequest } from '../StaticFunctions'
import { EVENT_SCANNEN } from '../Internationalization/i18n'
import EventScanDialog from '../../Event/EventScanDialog'
import style from './eventQrLogin.module.scss'

const EventQrLogin = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [scanOpen, setScanOpen] = useState(true)

    const handleScan = (code: string) => {
        setScanOpen(false)
        doPostRequest('login/qr', { code }).then((value) => {
            if (value.code === 200) {
                const memberID = value.content?.memberID ?? (value.content?.member?.id ?? null)
                if (memberID !== null && memberID !== undefined) {
                    navigate('/user/' + memberID)
                } else {
                    navigate('/')
                }
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    return (
        <main className={style.container}>
            <Paper className={style.card} elevation={2}>
                <Avatar className={style.icon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                    <QrCodeScanner />
                </Avatar>
                <div>
                    <Typography variant="overline" color="text.secondary">Drinklist</Typography>
                    <Typography variant="h3">QR Login</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Scanne deine persönliche Karte, um dein Konto zu öffnen.
                    </Typography>
                </div>
                <Button variant="contained" size="large" startIcon={<QrCodeScanner />} onClick={() => setScanOpen(true)}>
                    {EVENT_SCANNEN}
                </Button>
            </Paper>
            <EventScanDialog
                open={scanOpen}
                title={EVENT_SCANNEN}
                onClose={() => navigate('/login')}
                onScanned={handleScan}
            />
        </main>
    )
}

export default EventQrLogin
