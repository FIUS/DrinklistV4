import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Member } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';
import { Autocomplete, Button, InputAdornment, TextField } from '@mui/material';
import { ABBRECHEN, AN_WEN_UEBERWEISEN, BETRAG, GELD_UEBERWEISEN, NAME, UEBERWEISEN } from '../../Common/Internationalization/i18n';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Reducer/reducerCombiner';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { format } from 'react-string-format';
import { openToast, setMembers } from '../../../Actions/CommonAction';

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const TransferDialog = (props: Props) => {

    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [selectedUser, setselectedUser] = useState<string | null>(null)
    const [amount, setamount] = useState(0)
    const dispatch = useDispatch();

    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>{GELD_UEBERWEISEN}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {AN_WEN_UEBERWEISEN}
                </DialogContentText>
                <Spacer vertical={20} />
                <Autocomplete
                    options={common.members ? common.members.map(value => value.name) : []}
                    value={selectedUser}
                    onChange={(event, value) => { setselectedUser(value !== null ? value : "") }}
                    renderInput={(params) =>
                        <TextField {...params}
                            label={NAME}
                            variant='standard'
                            onChange={(value) => { setselectedUser(value.target.value) }}
                        />
                    }
                />
                <Spacer vertical={10} />
                <TextField
                    label={BETRAG}
                    variant='standard'
                    type='number'
                    onChange={(value) => { setamount(parseFloat(value.target.value)) }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    }}
                />

            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{ABBRECHEN}</Button>
                <Button onClick={() => {
                    const from = props.member.id;
                    const to = common.members?.find((value) => {
                        return value.name === selectedUser;
                    })?.id;
                    doPostRequest(format("users/{0}/transfer/{1}", from, to ? to : -1), { amount: amount }).then(value => {
                        if (value.code === 200) {
                            dispatch(openToast({ message: "Geld überwiesen", type: "success" }))
                            doGetRequest("users").then((t_value) => {
                                if (t_value.code === 200) {
                                    dispatch(setMembers(t_value.content))
                                }
                            })
                            props.close()
                        } else {
                            dispatch(openToast({ message: value.content, type: "error" }))
                        }
                    })
                }}>
                    {UEBERWEISEN}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TransferDialog