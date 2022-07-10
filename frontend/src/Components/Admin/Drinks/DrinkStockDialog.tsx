import React from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Spacer from '../../Common/Spacer';
import style from './drinks.module.scss';

type Props = {
    isOpen: boolean,
    close: () => void,
    drinkname: string
}

const DrinkStockDialog = (props: Props) => {

    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>Neue Verfügbarkeit</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Ändere hier die Anzahl der Flaschen die für '{props.drinkname}' verfügbar sind
                </DialogContentText>
                <Spacer vertical={15} />
                <div className={style.stockDialog}>
                    <Button variant='outlined'>
                        Auf 0 setzen
                    </Button>
                    <div className={style.stockDialogInner}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label='Setzen auf...'
                            variant='standard'
                            type='number'
                            fullWidth
                            onChange={(value) => console.log(value.target.value)}
                        />
                        <Button variant='outlined'>
                            Setzen
                        </Button>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>Fertig</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DrinkStockDialog