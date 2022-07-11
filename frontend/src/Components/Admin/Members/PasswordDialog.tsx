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

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const PasswordDialog = (props: Props) => {

    let newPassword = ""
    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>Neues Passwort festlegen</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Gebe hier das neue passwort für den nutzer '{props.member.name}' ein
                </DialogContentText>
                <TextField
                    fullWidth
                    autoFocus
                    defaultValue={newPassword}
                    margin="dense"
                    label='Passwort'
                    variant='standard'
                    type='password'
                    onChange={(value) => newPassword = value.target.value}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>Abbrechen</Button>
                <Button onClick={() => {
                    if (newPassword === "") {
                        return
                    }

                    doPostRequest("users/" + props.member.id + "/password", { password: newPassword }).then(value => {
                        if (value.code === 200) {
                            props.close()
                        }
                    })

                }}>Aktualisieren</Button>
            </DialogActions>
        </Dialog>
    )
}

export default PasswordDialog