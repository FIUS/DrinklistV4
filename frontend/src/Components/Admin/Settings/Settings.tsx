import { Button, Typography } from '@mui/material'
import React from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import { downloadJSON } from '../../Common/StaticFunctions'
import style from './settings.module.scss'

type Props = {}

const Settings = (props: Props) => {
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
            </div>
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Settings