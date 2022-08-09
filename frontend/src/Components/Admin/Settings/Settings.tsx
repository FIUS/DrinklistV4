import { Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast } from '../../../Actions/CommonAction'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import { doPostRequestRawBody, downloadJSON } from '../../Common/StaticFunctions'
import style from './settings.module.scss'

type Props = {}

const Settings = (props: Props) => {
    const [file, setfile] = useState<any>(null)
    const [isUploading, setisUploading] = useState(false)

    const dispatch = useDispatch()

    return (
        <>
            <div className={style.container}>
                <Typography variant='h5'>Backup Drinklist</Typography>
                <Button onClick={() => {
                    downloadJSON("settings/backup", "backup-drinklist-" + new Date().toLocaleDateString() + ".json")
                }}
                    variant="contained"
                >
                    Download Backup
                </Button>
                <div className={style.uploadContainer}>
                    <Button disabled={isUploading}
                        onClick={() => {
                            const formData = new FormData();
                            if (file != null) {
                                setisUploading(true)
                                dispatch(openToast({ message: "Backup wird hochgeladen und eingespielt", headline: "Upload", type: "info" }))

                                formData.append('file', file)
                                doPostRequestRawBody("settings/restore", formData).then((value) => {
                                    setisUploading(false)
                                    if (value.code === 200) {
                                        dispatch(openToast({ message: "Backup wurde erfolgreich eingespielt", type: "success", headline: "Eingespielt", duration: 8000 }))
                                    } else {
                                        dispatch(openErrorToast())
                                    }
                                })
                            }
                        }}
                        variant="contained"
                    >
                        Upload Backup
                    </Button>
                    <input className={style.fileInput} type="file" name="file" onChange={(value) => {

                        if (value.target.files && value.target.files[0] != null) {
                            setfile(value.target.files[0])
                        }
                    }}
                    />
                </div>
            </div>
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Settings