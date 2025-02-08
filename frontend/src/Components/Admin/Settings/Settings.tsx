import { Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast } from '../../../Actions/CommonAction'
import { ADMIN_PW, ALTE_DATEN_UEBERSCHRIEBEN, BACKUP_ERFOLG, BACKUP_UPLOADING, DOWNLOAD_BACKUP, EINGESPIELT, KEINE_DATEI, KIOSK_PW, KONNTE_NICHT_EINSPIELEN, PASSWOERTER_AENDERN, SICHER_ALTE_DATEN_UEBERSCHRIEBEN, UPLOAD, UPLOAD_BACKUP } from '../../Common/Internationalization/i18n'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer'
import { doPostRequestRawBody, downloadJSON } from '../../Common/StaticFunctions'
import WarningPopup from '../../Common/WarningPopup/WarningPopup'
import PasswordChange from './PasswordChange'
import style from './settings.module.scss'

type Props = {}

const Settings = (props: Props) => {
    const [file, setfile] = useState<any>(null)
    const [isUploading, setisUploading] = useState(false)
    const [warningBackupOpen, setwarningBackupOpen] = useState(false)

    const dispatch = useDispatch()

    return (
        <>
            <div className={style.container}>
                <Typography variant='h5'>Backup Drinklist</Typography>
                <Button onClick={() => {
                    const now = new Date()
                    downloadJSON("settings/backup", "backup-drinklist-" + now.toLocaleDateString() + "-" + now.toTimeString() + ".json")
                }}
                    variant="contained"
                >
                    {DOWNLOAD_BACKUP}
                </Button>
                <div className={style.uploadContainer}>
                    <Button disabled={isUploading}
                        onClick={() => {
                            setwarningBackupOpen(true)
                        }}
                        variant="contained"
                    >
                        {UPLOAD_BACKUP}
                    </Button>
                    <input className={style.fileInput} type="file" name="file" onChange={(value) => {

                        if (value.target.files && value.target.files[0] != null) {
                            setfile(value.target.files[0])
                        }
                    }}
                    />
                </div>
                <Spacer vertical={20} />
                <Typography variant='h5'>{PASSWOERTER_AENDERN}</Typography>
                <PasswordChange textfielLabel={ADMIN_PW} requestPath='settings/password/admin' />
                <PasswordChange textfielLabel={KIOSK_PW} requestPath='settings/password/kiosk' />
                <WarningPopup
                    title={ALTE_DATEN_UEBERSCHRIEBEN}
                    text={SICHER_ALTE_DATEN_UEBERSCHRIEBEN}
                    isOpen={warningBackupOpen}
                    close={setwarningBackupOpen}
                    yes={() => {
                        const formData = new FormData();
                        if (file != null) {
                            setisUploading(true)
                            dispatch(openToast({ message: BACKUP_UPLOADING, headline: UPLOAD, type: "info" }))

                            formData.append('file', file)
                            doPostRequestRawBody("settings/restore", formData).then((value) => {
                                setisUploading(false)
                                if (value.code === 200) {
                                    dispatch(openToast({ message: BACKUP_ERFOLG, type: "success", headline: EINGESPIELT, duration: 8000 }))
                                } else {
                                    dispatch(openErrorToast())
                                }
                            })
                        } else {
                            dispatch(openToast({ headline: KONNTE_NICHT_EINSPIELEN, message: KEINE_DATEI, type: "error", duration: 5000 }))
                        }
                    }}
                    no={() => { }}
                />
            </div>
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Settings