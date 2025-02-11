import React from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { doPostRequest } from '../../Common/StaticFunctions';
import { Member } from '../../../types/ResponseTypes';
import { ABBRECHEN, AKTUALISIEREN, LOKALES_PASSWORT_AENDERN, NEUES_PASSWORT_FESTLEGEN, NEUES_PASSWORT_FUER_NUTZER, PASSWORT } from '../../Common/Internationalization/i18n';
import { format } from 'react-string-format';
import Spacer from '../../Common/Spacer';

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const PasswordDialog = (props: Props) => {

    let newPassword = ""
    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>{NEUES_PASSWORT_FESTLEGEN}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {format(NEUES_PASSWORT_FUER_NUTZER, props.member.name)}
                </DialogContentText>
                {window.globalTS.OIDC_BUTTON_TEXT !== null && window.globalTS.OIDC_BUTTON_TEXT !== undefined && window.globalTS.OIDC_BUTTON_TEXT !== "" ?
                    <>
                        <Spacer vertical={20} />
                        <DialogContentText>
                            {format(LOKALES_PASSWORT_AENDERN, window.globalTS.OIDC_BUTTON_TEXT)}
                        </DialogContentText>
                    </> : <></>
                }
                <TextField
                    fullWidth
                    autoFocus
                    defaultValue={newPassword}
                    margin="dense"
                    label={PASSWORT}
                    variant='standard'
                    type='password'
                    onChange={(value) => newPassword = value.target.value}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{ABBRECHEN}</Button>
                <Button onClick={() => {
                    if (newPassword === "") {
                        return
                    }

                    doPostRequest("users/" + props.member.id + "/password", { password: newPassword }).then(value => {
                        if (value.code === 200) {
                            props.close()
                        }
                    })

                }}>{AKTUALISIEREN}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default PasswordDialog