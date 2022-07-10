import React from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type Props = {
    isOpen: boolean,
    close: () => void,
    drinkname: string
}

const DrinkPriceDialog = (props: Props) => {

    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>Neuer Preis</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Gebe hier den neuen Preis für das Getränk '{props.drinkname}' ein
                </DialogContentText>
                <TextField
                    fullWidth
                    autoFocus
                    margin="dense"
                    label='Preis in Euro'
                    variant='standard'
                    type='number'
                    onChange={(value) => console.log(value.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>Abbrechen</Button>
                <Button onClick={props.close}>Aktualisieren</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DrinkPriceDialog