import {
    AdminPanelSettings,
    ArrowBack,
    CloudDownload,
    CloudUpload,
    PointOfSale,
    Settings as SettingsIcon
} from '@mui/icons-material'
import { Avatar, Button, Chip, Paper, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { openErrorToast, openToast } from '../../../Actions/CommonAction'
import {
    ADMIN_PW,
    ALTE_DATEN_UEBERSCHRIEBEN,
    BACKUP_ERFOLG,
    BACKUP_UPLOADING,
    DOWNLOAD_BACKUP,
    EINGESPIELT,
    KEINE_DATEI,
    KIOSK_PW,
    KONNTE_NICHT_EINSPIELEN,
    PASSWOERTER_AENDERN,
    SICHER_ALTE_DATEN_UEBERSCHRIEBEN,
    UPLOAD,
    UPLOAD_BACKUP,
    ZURUECK
} from '../../Common/Internationalization/i18n'
import { doPostRequestRawBody, downloadJSON } from '../../Common/StaticFunctions'
import WarningPopup from '../../Common/WarningPopup/WarningPopup'
import PasswordChange from './PasswordChange'
import style from './settings.module.scss'

const Settings = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [warningBackupOpen, setWarningBackupOpen] = useState(false)

    const downloadBackup = () => {
        const now = new Date()
        const timestamp = now.toISOString().replace(/[:.]/g, '-')
        downloadJSON('settings/backup', `backup-drinklist-${timestamp}.json`)
    }

    const restoreBackup = () => {
        if (file === null) {
            dispatch(openToast({
                headline: KONNTE_NICHT_EINSPIELEN,
                message: KEINE_DATEI,
                type: 'error',
                duration: 5000
            }))
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        setIsUploading(true)
        dispatch(openToast({ message: BACKUP_UPLOADING, headline: UPLOAD, type: 'info' }))

        doPostRequestRawBody('settings/restore', formData).then((value) => {
            if (value.code === 200) {
                dispatch(openToast({
                    message: BACKUP_ERFOLG,
                    type: 'success',
                    headline: EINGESPIELT,
                    duration: 8000
                }))
                setFile(null)
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setIsUploading(false))
    }

    return (
        <main className={style.container}>
            <header className={style.header}>
                <div className={style.titleBlock}>
                    <Avatar className={style.heroIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                        <SettingsIcon />
                    </Avatar>
                    <div>
                        <Typography variant="overline" color="text.secondary">Administration</Typography>
                        <Typography variant="h3">Einstellungen</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Zugangsdaten verwalten und Drinklist-Daten sichern.
                        </Typography>
                    </div>
                </div>
                <Button startIcon={<ArrowBack />} variant="outlined" onClick={() => navigate('/admin')}>
                    {ZURUECK}
                </Button>
            </header>

            <div className={style.settingsGrid}>
                <Paper className={style.sectionCard} elevation={1}>
                    <div className={style.sectionHeader}>
                        <Avatar className={style.sectionIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                            <CloudDownload />
                        </Avatar>
                        <div>
                            <Typography variant="h5">Backup</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Daten sichern oder eine bestehende Sicherung einspielen.
                            </Typography>
                        </div>
                    </div>

                    <div className={style.backupActions}>
                        <div className={style.actionBlock}>
                            <Typography variant="h6">Sicherung herunterladen</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Erstellt eine JSON-Datei mit den aktuellen Drinklist-Daten.
                            </Typography>
                            <Button startIcon={<CloudDownload />} variant="contained" onClick={downloadBackup}>
                                {DOWNLOAD_BACKUP}
                            </Button>
                        </div>

                        <div className={`${style.actionBlock} ${style.restoreBlock}`}>
                            <Typography variant="h6">Sicherung wiederherstellen</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Achtung: Die vorhandenen Daten werden durch den Inhalt der Datei ersetzt.
                            </Typography>
                            <div className={style.fileActions}>
                                <Button component="label" startIcon={<CloudUpload />} variant="outlined" disabled={isUploading}>
                                    Datei auswählen
                                    <input
                                        key={file?.name ?? 'empty-file-input'}
                                        className={style.fileInput}
                                        type="file"
                                        name="file"
                                        accept=".json,application/json"
                                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                                    />
                                </Button>
                                {file ? <Chip label={file.name} onDelete={isUploading ? undefined : () => setFile(null)} /> : null}
                            </div>
                            <Button
                                startIcon={<CloudUpload />}
                                variant="contained"
                                color="warning"
                                disabled={isUploading || file === null}
                                onClick={() => setWarningBackupOpen(true)}
                            >
                                {isUploading ? BACKUP_UPLOADING : UPLOAD_BACKUP}
                            </Button>
                        </div>
                    </div>
                </Paper>

                <Paper className={style.sectionCard} elevation={1}>
                    <div className={style.sectionHeader}>
                        <Avatar className={style.sectionIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR_SECONDARY }}>
                            <AdminPanelSettings />
                        </Avatar>
                        <div>
                            <Typography variant="h5">{PASSWOERTER_AENDERN}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Separate Passwörter für Administration und Kiosk festlegen.
                            </Typography>
                        </div>
                    </div>
                    <div className={style.passwordList}>
                        <PasswordChange
                            icon={<AdminPanelSettings />}
                            description="Schützt den Zugriff auf die Verwaltungsoberfläche."
                            textfielLabel={ADMIN_PW}
                            requestPath="settings/password/admin"
                        />
                        <PasswordChange
                            icon={<PointOfSale />}
                            description="Wird für den eingeschränkten Kiosk-Zugang verwendet."
                            textfielLabel={KIOSK_PW}
                            requestPath="settings/password/kiosk"
                        />
                    </div>
                </Paper>
            </div>

            <WarningPopup
                title={ALTE_DATEN_UEBERSCHRIEBEN}
                text={SICHER_ALTE_DATEN_UEBERSCHRIEBEN}
                isOpen={warningBackupOpen}
                close={setWarningBackupOpen}
                yes={restoreBackup}
                no={() => { }}
            />
        </main>
    )
}

export default Settings
