import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Member } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';
import { Autocomplete, Avatar, Button, InputAdornment, Paper, TextField } from '@mui/material';
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
// eslint-disable-next-line
import style from './details.module.scss'
import { calculateAvatarText, safeMemberName, stringToColor } from '../../Common/StaticFunctionsTyped';
import UserBox from './UserBox';
import TransferSummary from './TransferSummary';

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const TransferDialog = (props: Props) => {

    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [selectedUser, setselectedUser] = useState({ "name": "", "id": -1 })
    const [search, setsearch] = useState("")
    const [reason, setreason] = useState<string | null>(null)
    const [amount, setamount] = useState(0)
    const [chosenEmoji, setChosenEmoji] = useState<string>("💸");
    const [transferButtonDisabled, settransferButtonDisabled] = useState(false)
    const dispatch = useDispatch();

    const resetInput = () => {
        setselectedUser({ "name": "", "id": -1 })
        setChosenEmoji("💸")
        setamount(0)
        setreason(null)
        settransferButtonDisabled(false)
    }

    const userSearch = (member: Member) => {
        return member.name.toLowerCase().includes(search.toLowerCase()) ||
            member.alias.toLowerCase().includes(search.toLowerCase())
    }

    return (
        <Dialog open={props.isOpen} onClose={props.close} sx={{ zIndex: 20000000 }} >
            <DialogTitle>{GELD_UEBERWEISEN}</DialogTitle>
            <DialogContent className={style.transferBox}>
                <DialogContentText>
                    {AN_WEN_UEBERWEISEN}
                </DialogContentText>
                <TextField
                    label={"Suche"}
                    variant='standard'
                    type='text'
                    value={search}
                    onChange={(value) => { setsearch(value.target.value) }}
                    fullWidth
                />
                {search !== "" ? <><Spacer vertical={15} /><div className={style.recommendationBox}>
                    {common.members?.filter((member) => userSearch(member)).slice(0, 3).map((member) => {
                        return <UserBox name={safeMemberName(member)} onClick={() => {
                            setselectedUser({ "name": safeMemberName(member), "id": member.id });
                            setsearch("")
                        }} />
                    })}
                </div> </> : <></>}

                <Spacer vertical={10} />
                <Typography variant='overline'>
                    Vorschläge
                </Typography>
                <div className={style.recommendationBox}>
                    <UserBox name="Tom" onClick={() => {
                        setselectedUser({ "name": "Tom", "id": 2 });
                        setsearch("")
                    }} />
                    <UserBox name="Pete" onClick={() => {
                        setselectedUser({ "name": "Tom", "id": 2 });
                        setsearch("")
                    }} />
                </div>
                <Spacer vertical={10} />
                <TextField
                    label={BETRAG}
                    variant='outlined'
                    type='number'
                    onChange={(value) => { setamount(parseFloat(value.target.value)) }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    }}
                />
                <Spacer vertical={15} />
                <TextField
                    label={VERWENDUNGSZWECK}
                    variant='outlined'
                    fullWidth
                    helperText={format("({0})", OPTIONAL)}
                    onChange={(value) => { setreason(value.target.value) }}
                />
                <Spacer vertical={10} />

                <TransferSummary amount={amount}
                    name={selectedUser.name}
                    icon={chosenEmoji ? chosenEmoji : "💸"}
                    details={reason ? reason : ""}
                    cancel={() => {
                        resetInput()
                        props.close()
                    }}
                    accept={() => {

                        const from = props.member.id;
                        const to = selectedUser.id;

                        if (to === -1) {
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

                        settransferButtonDisabled(true)
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
                                settransferButtonDisabled(false)
                            }
                        })
                    }}
                />
                <Spacer vertical={25} />
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography>{MEHR_OPTIONEN}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="h5">{EMOJI_DP} {chosenEmoji}</Typography>
                        <Spacer vertical={10} />
                        <Picker onEmojiSelect={(value: any) => { setChosenEmoji(value.native) }} />
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
        </Dialog>
    )
}

export default TransferDialog