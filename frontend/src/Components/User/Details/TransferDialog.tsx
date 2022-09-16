import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Member } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';
import { Autocomplete, Button, InputAdornment, TextField } from '@mui/material';
import { ABBRECHEN, AN_WEN_UEBERWEISEN, BETRAG, BETRAG_NICHT_NEGATIV, BITTE_EMPFAENGER, EMOJI_DP, GELD_UEBERWEISEN, GELD_UEBERWIESEN, MEHR_OPTIONEN, NAME, OPTIONAL, UEBERWEISEN, VERWENDUNGSZWECK } from '../../Common/Internationalization/i18n';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Reducer/reducerCombiner';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { format } from 'react-string-format';
import { openToast, setHistory, setMembers } from '../../../Actions/CommonAction';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Picker from '@emoji-mart/react'

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const TransferDialog = (props: Props) => {

    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [selectedUser, setselectedUser] = useState<string | null>(null)
    const [reason, setreason] = useState<string | null>(null)
    const [amount, setamount] = useState(0)
    const [chosenEmoji, setChosenEmoji] = useState<string>("💸");

    const dispatch = useDispatch();

    const resetInput = () => {
        setselectedUser(null)
        setamount(0)
        setreason(null)
    }

    return (
        <Dialog open={props.isOpen} onClose={props.close} sx={{ zIndex: 20000000 }}>
            <DialogTitle>{GELD_UEBERWEISEN}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {AN_WEN_UEBERWEISEN}
                </DialogContentText>
                <Spacer vertical={20} />
                <Autocomplete
                    sx={{ zIndex: 20000001 }}
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
                <Spacer vertical={20} />
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography>{MEHR_OPTIONEN}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TextField
                            label={VERWENDUNGSZWECK}
                            fullWidth
                            helperText={format("({0})", OPTIONAL)}
                            variant='standard'
                            onChange={(value) => { setreason(value.target.value) }}
                        />
                        <Spacer vertical={30} />
                        <Typography variant="h5">{EMOJI_DP} {chosenEmoji}</Typography>
                        <Spacer vertical={10} />
                        <Picker onEmojiSelect={(value: any) => { setChosenEmoji(value.native) }} />
                    </AccordionDetails>
                </Accordion>


            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    resetInput()
                    props.close()
                }}>
                    {ABBRECHEN}
                </Button>
                <Button onClick={() => {
                    const from = props.member.id;
                    const to = common.members?.find((value) => {
                        return value.name === selectedUser;
                    })?.id;


                    if (!to) {
                        dispatch(openToast({ message: BITTE_EMPFAENGER, type: "error" }))
                        return
                    }
                    if (amount < 0) {
                        dispatch(openToast({ message: BETRAG_NICHT_NEGATIV, type: "error" }))
                        return
                    }

                    let payload: { amount: number, emoji: string } | { amount: number, reason: string, emoji: string } = { amount: amount, emoji: chosenEmoji }
                    if (reason !== null && reason !== "") {
                        payload = { ...payload, reason: reason }
                    }

                    doPostRequest(format("users/{0}/transfer/{1}", from, to ? to : -1), payload).then(value => {
                        if (value.code === 200) {
                            dispatch(openToast({ message: GELD_UEBERWIESEN, type: "success" }))
                            doGetRequest("users").then((t_value) => {
                                if (t_value.code === 200) {
                                    dispatch(setMembers(t_value.content))
                                }
                            })
                            doGetRequest("users/" + from + "/history").then((value) => {
                                if (value.code === 200) {
                                    dispatch(setHistory(value.content))
                                }
                            })

                            resetInput()
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