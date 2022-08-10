import React, { useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { Member } from '../../../types/ResponseTypes';
import { InputAdornment, Typography } from '@mui/material';
import Spacer from '../../Common/Spacer';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import style from './exchangedialog.module.scss';
import { setMembers } from '../../../Actions/CommonAction';
import { useDispatch } from 'react-redux';
import { ABBRECHEN, AKTUALISIEREN, AKTUELL, GUTHABEN_HINZUFUEGEN, MENGE_EINZUZAHLENDES_GELD, NEU } from '../../Common/Internationalization/i18n';
import { format } from 'react-string-format';

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const ExchangeDialog = (props: Props) => {
    const [amount, setamount] = useState(0)
    const dispatch = useDispatch()

    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>{GUTHABEN_HINZUFUEGEN}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {format(MENGE_EINZUZAHLENDES_GELD, props.member.name)}
                </DialogContentText>
                <Spacer vertical={20} />
                <div className={style.outter}>
                    <div className={style.inner}>
                        <Typography variant='h4'>{AKTUELL}</Typography>
                        <Typography variant='h3'>{props.member.balance.toFixed(2)}€</Typography>
                    </div>
                    <div className={style.inner}>
                        <TextField
                            fullWidth
                            autoFocus
                            defaultValue={amount}
                            margin="dense"
                            variant='standard'
                            type='number'
                            className={style.textfield}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">€</InputAdornment>,
                            }}
                            onChange={(value) => {
                                if (parseFloat(value.target.value)) {
                                    setamount(parseFloat(value.target.value))
                                }
                            }
                            }
                        />
                        <ArrowRightAltIcon className={style.arrow} />
                    </div>
                    <div className={style.inner}>
                        <Typography variant='h4'>{NEU}</Typography>
                        <Typography variant='h3'>{(props.member.balance + amount).toFixed(2)}€</Typography>
                    </div>
                </div>



            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{ABBRECHEN}</Button>
                <Button onClick={() => {
                    if (amount === 0) {
                        return
                    }

                    doPostRequest("users/" + props.member.id + "/deposit", { amount: amount }).then(value => {
                        if (value.code === 200) {
                            doGetRequest("users").then((value) => {
                                if (value.code === 200) {
                                    dispatch(setMembers(value.content))
                                }
                                setamount(0)
                            })
                            props.close()
                        }
                    })


                }}>{AKTUALISIEREN}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ExchangeDialog