import { Button, Typography } from '@mui/material';
import React from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import style from './topbar.module.scss';

type Props = {
    title: string,
    link: string
}

const SettingsLink = (props: Props) => {
    if (props.link === "") {
        return <></>
    } else {
        return (
            < div className={style.aboutDialogRow} >
                <Typography variant="overline">
                    {props.title}
                </Typography>
                <Button onClick={() => {
                    window.open(props.link, '_blank');
                }}>Öffnen<OpenInNewIcon />
                </Button>
            </div >
        )
    }

}

export default SettingsLink