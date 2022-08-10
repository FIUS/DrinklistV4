import React from 'react'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Typography } from '@mui/material';
import style from './topbar.module.scss';
import SettingsLink from './SettingsLink';

type Props = {
    isOpen: boolean,
    close: () => void
}

const About = (props: Props) => {

    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>Impressum/Datenschutz</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <div className={style.aboutDialogContainer}>
                        {window.globalTS.ORGANISATION_NAME !== "" ? <div className={style.aboutDialogRow}>
                            <Typography variant="overline">Getränkeliste </Typography>
                            <Typography variant="h5">{window.globalTS.ORGANISATION_NAME}</Typography>
                        </div> : <></>}
                        <div>
                            <SettingsLink title='Impressum' link={window.globalTS.ABOUT_LINK} />
                            <SettingsLink title='Datenschutz' link={window.globalTS.PRIVACY_LINK} />
                        </div>
                        {window.globalTS.ADDITIONAL_INFORMATION !== "" ? <Typography>
                            {window.globalTS.ADDITIONAL_INFORMATION}
                        </Typography> : <></>}
                    </div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>OK</Button>
            </DialogActions>
        </Dialog>
    )
}

export default About