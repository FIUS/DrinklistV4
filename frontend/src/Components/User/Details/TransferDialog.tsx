import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Member } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';
import { InputAdornment, TextField } from '@mui/material';
import { AN_WEN_UEBERWEISEN, BETRAG, BETRAG_NICHT_NEGATIV, BITTE_EMPFAENGER, EMOJI_DP, GELD_UEBERWEISEN, GELD_UEBERWIESEN, MEHR_OPTIONEN, OPTIONAL, SUCHE_DOT_DOT_DOT, VERWENDUNGSZWECK, VORSCHLAEGE } from '../../Common/Internationalization/i18n';
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

import style from './details.module.scss'
import { safeMemberName } from '../../Common/StaticFunctionsTyped';
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

    const filterTransactions = () => {
        const transactions = common.history?.filter(transaction => transaction.memberID === props.member.id).filter(t => {
            return t.description.toLocaleLowerCase().includes("transfer")
        }).splice(0, 5)

        const memberNames: [string, number][] | undefined = common.members?.map(member => [safeMemberName(member), member.id])
        let transactionCount: { [key: string]: [number, number] } = {}
        memberNames?.forEach(member => transactionCount[member[0]] = [member[1], 0])
        transactions?.forEach(t => {
            memberNames?.forEach(m => {
                if (t.description.toLocaleLowerCase().includes(m[0].toLocaleLowerCase())) {
                    transactionCount[m[0]] = [m[1], transactionCount[m[0]][1] + 1]
                }
            })
        })
        // Convert transactionCount to key value pairs
        const transactionCountArray: Array<[string, number, number]> = Object.keys(transactionCount).map((key) => [key, ...transactionCount[key]]);
        // Sort the array based on the second element (high to low)
        transactionCountArray.sort((first, second) => second[2] - first[2]);

        // Return the first 2 elements
        return transactionCountArray.slice(0, 2)
    }

    return (
        <Dialog open={props.isOpen} onClose={props.close} sx={{ zIndex: 20000000 }} >
            <DialogTitle>{GELD_UEBERWEISEN}</DialogTitle>
            <DialogContent className={style.transferBox}>
                <DialogContentText>
                    {AN_WEN_UEBERWEISEN}
                </DialogContentText>
                <TextField
                    label={SUCHE_DOT_DOT_DOT}
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
                    {VORSCHLAEGE}
                </Typography>
                <div className={style.recommendationBox}>
                    {filterTransactions().map(transaction => {
                        return <UserBox name={transaction[0]} onClick={() => {
                            setselectedUser({ "name": transaction[0], "id": transaction[1] });
                            setsearch("")
                        }} />
                    })}
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
                    acceptButtonDisabled={transferButtonDisabled}
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